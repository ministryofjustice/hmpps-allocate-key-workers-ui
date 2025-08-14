import { Request, Response } from 'express'
import { format, lastDayOfMonth, startOfMonth, subMonths, isLastDayOfMonth } from 'date-fns'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import { formatDateConcise } from '../../utils/datetimeUtils'
import { ResQuerySchemaType } from './schema'

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
                    'This figure displays the total number of [staff] sessions that happened in the selected date range. It is calculated using the date recorded in [staff] session case notes.',
                },
              ]
            : []),
          {
            heading: 'Number of recorded [staff] entries',
            type: 'number',
            currentValue: stats.current?.recordedEvents?.find(o => o.type === 'ENTRY')?.count || 0,
            previousValue: stats.previous?.recordedEvents?.find(o => o.type === 'ENTRY')?.count || 0,
            calculationMethod:
              'This figure displays the total number of [staff] entries that happened in the selected date range. It is calculated using the date recorded in [staff] entry case notes.',
          },
          {
            heading: 'Total number of prisoners',
            type: 'number',
            currentValue: stats.current?.totalPrisoners,
            previousValue: stats.previous?.totalPrisoners,
            calculationMethod:
              'This figure displays the average number of prisoners in the establishment during the selected date range.',
          },
          ...(prison.hasPrisonersWithHighComplexityNeeds
            ? [
                {
                  heading: 'Total number of high complexity prisoners',
                  type: 'number',
                  currentValue: stats.current?.highComplexityOfNeedPrisoners,
                  previousValue: stats.previous?.highComplexityOfNeedPrisoners,
                  calculationMethod:
                    'This figure displays the average number of high complexity prisoners in the establishment during the selected date range.',
                },
              ]
            : []),
          {
            heading: 'Percentage of prisoners with an allocated [staff]',
            type: 'percentage',
            currentValue: stats.current?.percentageAssigned,
            previousValue: stats.previous?.percentageAssigned,
            calculationMethod:
              'This figure is calculated by dividing the total number of prisoners in the establishment by the total number of prisoners who have been allocated a [staff].',
          },
          {
            heading: 'Total number of active [staffs]',
            type: 'number',
            currentValue: stats.current?.eligibleStaff,
            previousValue: stats.previous?.eligibleStaff,
            calculationMethod:
              'This figure displays the average total number of active [staffs] in the establishment during the selected date range. This does not include [staffs] with an unavailable or inactive status.',
          },
          prison.hasPrisonersWithHighComplexityNeeds
            ? {
                heading: 'Average time from eligibility to first [staff] session',
                type: 'day',
                currentValue: stats.current?.avgReceptionToRecordedEventDays,
                previousValue: stats.previous?.avgReceptionToRecordedEventDays,
                calculationMethod: `This figure displays the average time between prisoners becoming eligible for ${req.middleware?.policy === 'KEY_WORKER' ? 'key work' : '[staff] sessions'} and the first recorded [staff] session for sessions recorded in the selected date range.`,
              }
            : {
                heading: 'Average time from reception to first [staff] session',
                type: 'day',
                currentValue: stats.current?.avgReceptionToRecordedEventDays,
                previousValue: stats.previous?.avgReceptionToRecordedEventDays,
                calculationMethod:
                  'This figure displays the average time between reception and the first recorded [staff] session for sessions recorded in the selected date range.',
              },
          prison.hasPrisonersWithHighComplexityNeeds
            ? {
                heading: 'Average time from eligibility to [staff] allocation',
                type: 'day',
                currentValue: stats.current?.avgReceptionToAllocationDays,
                previousValue: stats.previous?.avgReceptionToAllocationDays,
                calculationMethod: `This figure displays the average time between prisoners becoming eligible for ${req.middleware?.policy === 'KEY_WORKER' ? 'key work' : '[staff] sessions'} and [staff] allocation for allocations made in the selected date range.`,
              }
            : {
                heading: 'Average time from reception to [staff] allocation',
                type: 'day',
                currentValue: stats.current?.avgReceptionToAllocationDays,
                previousValue: stats.previous?.avgReceptionToAllocationDays,
                calculationMethod:
                  'This figure displays the average time between reception and [staff] allocation for allocations made in the selected date range.',
              },
          {
            heading: `Delivery rate against frequency of a session every ${prison.frequencyInWeeks === 1 ? 'week' : `${prison.frequencyInWeeks} weeks`}`,
            type: 'percentage',
            currentValue: stats.current?.recordedEventComplianceRate,
            previousValue: stats.previous?.recordedEventComplianceRate,
            calculationMethod:
              'This figure is calculated by comparing the number of recorded [staff] sessions against the number of projected [staff] sessions. <br /> <br />' +
              'The number of projected [staff] sessions is calculated by taking the total number of prisoners with an allocated [staff] and comparing it to the expected frequency of [staff] sessions.',
          },
          {
            heading: 'Number of projected [staff] sessions',
            type: 'number',
            currentValue: stats.current?.projectedRecordedEvents,
            previousValue: stats.previous?.projectedRecordedEvents,
            calculationMethod:
              'This figure is calculated by taking the total number of prisoners with an allocated [staff] and comparing it to the expected frequency of [staff] sessions.',
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
    res.redirect(`data?dateFrom=${req.body.dateFrom ?? ''}&dateTo=${req.body.dateTo ?? ''}`)
  }
}
