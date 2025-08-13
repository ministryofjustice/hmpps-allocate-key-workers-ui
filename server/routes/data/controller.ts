import { Request, Response } from 'express'
import { format, lastDayOfMonth, startOfMonth, subMonths, isLastDayOfMonth } from 'date-fns'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import { formatDateConcise } from '../../utils/datetimeUtils'
import { ResQuerySchemaType } from './schema'
import { getHistoryParam } from '../../middleware/historyMiddleware'

export class StaffDataController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  private getDateAsIsoString = () => {
    const today = new Date()
    const lastDay = isLastDayOfMonth(today) ? today : lastDayOfMonth(subMonths(today, 1))
    const firstDay = startOfMonth(lastDay)
    return { dateFrom: format(firstDay, 'yyyy-MM-dd'), dateTo: format(lastDay, 'yyyy-MM-dd') }
  }

  GET = async (req: Request, res: Response) => {
    const resQuery = res.locals['query'] as ResQuerySchemaType
    const nowSpan = resQuery?.validated ?? this.getDateAsIsoString()
    const prisonCode = res.locals.user.getActiveCaseloadId()!
    const stats = await this.keyworkerApiService.getPrisonStats(req, prisonCode, nowSpan.dateFrom, nowSpan.dateTo)
    const prison = req.middleware!.prisonConfiguration!

    const data = stats.current
      ? [
          ...(req.middleware?.policy !== 'PERSONAL_OFFICER'
            ? [
                {
                  heading: 'Number of recorded [staff] sessions',
                  type: 'number',
                  currentValue: stats.current?.recordedEvents?.find(o => o.type === 'SESSION')?.count || 0,
                  previousValue: stats.previous?.recordedEvents?.find(o => o.type === 'SESSION')?.count || 0,
                  calculationMethod:
                    'This figure is calculated by taking the total number of [staff] session case notes created in the selected date range.',
                },
              ]
            : []),
          {
            heading: 'Number of recorded [staff] entries',
            type: 'number',
            currentValue: stats.current?.recordedEvents?.find(o => o.type === 'ENTRY')?.count || 0,
            previousValue: stats.previous?.recordedEvents?.find(o => o.type === 'ENTRY')?.count || 0,
            calculationMethod:
              'This figure is calculated by taking the total number of [staff] entry case notes created in the selected date range.',
          },
          {
            heading: 'Total number of prisoners',
            type: 'number',
            currentValue: stats.current?.totalPrisoners,
            previousValue: stats.previous?.totalPrisoners,
            calculationMethod:
              'This figure displays the average number of prisoners in the establishment during the date range selected.',
          },
          ...(prison.hasPrisonersWithHighComplexityNeeds
            ? [
                {
                  heading: 'Total number of high complexity prisoners',
                  type: 'number',
                  currentValue: stats.current?.highComplexityOfNeedPrisoners,
                  previousValue: stats.previous?.highComplexityOfNeedPrisoners,
                  calculationMethod:
                    'This figure displays the average number of high complexity prisoners in the establishment during the date range selected.',
                },
              ]
            : []),
          {
            heading: 'Percentage of prisoners with an allocated [staff]',
            type: 'percentage',
            currentValue: stats.current?.percentageAssigned,
            previousValue: stats.previous?.percentageAssigned,
            calculationMethod:
              'This figure is created by dividing the total number of prisoners in the establishment with the total number of prisoners who have been allocated a [staff].',
          },
          {
            heading: 'Total number of active [staffs]',
            type: 'number',
            currentValue: stats.current?.eligibleStaff,
            previousValue: stats.previous?.eligibleStaff,
            calculationMethod:
              'This figure displays the average total number of active [staffs] in the establishment during the date range selected. This does not include [staffs] with an unavailable or inactive status.',
          },
          {
            heading: 'Average time from reception to first [staff] session',
            type: 'day',
            currentValue: stats.current?.avgReceptionToRecordedEventDays,
            previousValue: stats.previous?.avgReceptionToRecordedEventDays,
            calculationMethod:
              'The reception date is calculated by taking the date from the latest instance of a transfer case note for the prisoner within the last 6 months. <br /> <br />' +
              'The first [staff] session is taken from the date of the first [staff] session case note added in the prison in the last 6 months. ',
          },
          {
            heading: 'Average time from reception to [staff] allocation',
            type: 'day',
            currentValue: stats.current?.avgReceptionToAllocationDays,
            previousValue: stats.previous?.avgReceptionToAllocationDays,
            calculationMethod:
              'The reception date is calculated by taking the date from the latest instance of a transfer case note for the prisoner within the last 6 months.',
          },
          {
            heading: `Delivery rate against frequency of a session every ${prison.frequencyInWeeks === 1 ? 'week' : `${prison.frequencyInWeeks} weeks`}`,
            type: 'percentage',
            currentValue: stats.current?.recordedEventComplianceRate,
            previousValue: stats.previous?.recordedEventComplianceRate,
            calculationMethod:
              'This figure is calculated by comparing the number of recorded [staff] sessions against the number of projected [staff] sessions. <br /> <br />' +
              'The number of projected [staff] sessions is calculated by taking the total number of prisoners with an allocated [staff] and comparing it to the expected frequency of [staff] sessions in the establishment.',
          },
          {
            heading: 'Number of projected [staff] sessions',
            type: 'number',
            currentValue: stats.current?.projectedRecordedEvents,
            previousValue: stats.previous?.projectedRecordedEvents,
            calculationMethod:
              'This figure is calculated by taking the total number of prisoners with an allocated [staff] and comparing it to the expected frequency of [staff] sessions in the establishment.',
          },
        ]
      : []

    res.render('data/view', {
      showBreadcrumbs: true,
      data,
      stats,
      dateFrom: resQuery?.dateFrom ?? formatDateConcise(stats.current?.from),
      dateTo: resQuery?.dateTo ?? formatDateConcise(stats.current?.to),
      dateUpdated: new Date().toISOString(),
    })
  }

  POST = async (req: Request, res: Response) => {
    const searchParams = new URLSearchParams({
      dateFrom: req.body.dateFrom,
      dateTo: req.body.dateTo,
      history: getHistoryParam(req),
    })
    res.redirect(`data?${searchParams.toString()}`)
  }
}
