import { Request, Response } from 'express'
import { format, lastDayOfMonth, startOfMonth, subMonths, isLastDayOfMonth } from 'date-fns'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import { components } from '../../@types/keyWorker'
import { formatDateConcise, getDateInReadableFormat } from '../../utils/datetimeUtils'
import { SchemaType } from './schema'

export class StaffDataController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  private getDateAsIsoString = () => {
    const today = new Date()
    const lastDay = isLastDayOfMonth(today) ? today : lastDayOfMonth(subMonths(today, 1))
    const firstDay = startOfMonth(lastDay)
    return { start: format(firstDay, 'yyyy-MM-dd'), end: format(lastDay, 'yyyy-MM-dd') }
  }

  private createPayload = (
    current: components['schemas']['PrisonStats']['current'],
    previous: components['schemas']['PrisonStats']['previous'],
    hasHighComplexityPrisoners: boolean,
    kwSessionFrequencyInWeeks: number,
  ) => {
    if (!current) return []

    const items = this.createStatsItems(current, previous, kwSessionFrequencyInWeeks)

    return Object.entries(items)
      .filter(itm => hasHighComplexityPrisoners || itm[0] !== 'highComplexityOfNeedPrisoners')
      .map(([key, val]) => {
        return {
          name: key,
          heading: val.heading,
          currentValue: val.currentValue,
          previousValue: val.previousValue,
          type: val.type || 'number',
          calculationMethod: val.calculationMethod,
        }
      })
  }

  private createStatsItems(
    current: components['schemas']['PrisonStats']['current'],
    previous: components['schemas']['PrisonStats']['previous'],
    kwSessionFrequencyInWeeks: number,
  ) {
    let complianceTitle = ''
    if (kwSessionFrequencyInWeeks > 1) {
      complianceTitle = `Delivery rate against frequency of a session every ${kwSessionFrequencyInWeeks} weeks`
    } else {
      complianceTitle = 'Delivery rate against frequency of a session every week'
    }

    return {
      keyworkerSessions: {
        heading: 'Number of recorded [staff] sessions',
        type: 'number',
        currentValue: current?.keyworkerSessions,
        previousValue: previous?.keyworkerSessions,
        calculationMethod:
          'This figure is calculated by taking the total number of [staff] session case notes created in the selected date range.',
      },
      keyworkerEntries: {
        heading: 'Number of recorded [staff] entries',
        type: 'number',
        currentValue: current?.keyworkerEntries,
        previousValue: previous?.keyworkerEntries,
        calculationMethod:
          'This figure is calculated by taking the total number of [staff] entry case notes created in the selected date range.',
      },
      totalPrisoners: {
        heading: 'Total number of prisoners',
        type: 'number',
        currentValue: current?.totalPrisoners,
        previousValue: previous?.totalPrisoners,
        calculationMethod:
          'This figure displays the average number of prisoners in the establishment during the date range selected.',
      },
      highComplexityOfNeedPrisoners: {
        heading: 'Total number of high complexity prisoners',
        type: 'number',
        currentValue: current?.highComplexityOfNeedPrisoners,
        previousValue: previous?.highComplexityOfNeedPrisoners,
        calculationMethod:
          'This figure displays the average number of high complexity prisoners in the establishment during the date range selected.',
      },
      percentageWithKeyworker: {
        heading: 'Percentage of prisoners with an allocated [staff]',
        type: 'percentage',
        currentValue: current?.percentageWithKeyworker,
        previousValue: previous?.percentageWithKeyworker,
        calculationMethod:
          'This figure is created by dividing the total number of prisoners in the establishment with the total number of prisoners who have been allocated a [staff].',
      },
      activeKeyworkers: {
        heading: 'Total number of active [staffs]',
        type: 'number',
        currentValue: current?.activeKeyworkers,
        previousValue: previous?.activeKeyworkers,
        calculationMethod:
          'This figure displays the average total number of active [staffs] in the establishment during the date range selected. This does not include [staffs] with an unavailable or inactive status.',
      },
      avgReceptionToSessionDays: {
        heading: 'Average time from reception to first [staff] session',
        type: 'day',
        currentValue: current?.avgReceptionToSessionDays,
        previousValue: previous?.avgReceptionToSessionDays,
        calculationMethod:
          'The reception date is calculated by taking the date from the latest instance of a transfer case note for the prisoner within the last 6 months. <br /> <br />' +
          'The first [staff] session is taken from the date of the first [staff] session case note added in the prison in the last 6 months. ',
      },
      avgReceptionToAllocationDays: {
        heading: 'Average time from reception to [staff] allocation',
        type: 'day',
        currentValue: current?.avgReceptionToAllocationDays,
        previousValue: previous?.avgReceptionToAllocationDays,
        calculationMethod:
          'The reception date is calculated by taking the date from the latest instance of a transfer case note for the prisoner within the last 6 months.',
      },
      compliance: {
        heading: complianceTitle,
        type: 'percentage',
        currentValue: current?.compliance,
        previousValue: previous?.compliance,
        calculationMethod:
          'This figure is calculated by comparing the number of recorded [staff] sessions against the number of projected [staff] sessions. <br /> <br />' +
          'The number of projected [staff] sessions is calculated by taking the total number of prisoners with an allocated [staff] and comparing it to the expected frequency of [staff] sessions in the establishment.',
      },
      projectedSessions: {
        heading: 'Number of projected [staff] sessions',
        type: 'number',
        currentValue: current?.projectedSessions,
        previousValue: previous?.projectedSessions,
        calculationMethod:
          'This figure is calculated by taking the total number of prisoners with an allocated [staff] and comparing it to the expected frequency of [staff] sessions in the establishment.',
      },
    }
  }

  GET = async (req: Request, res: Response) => {
    const nowSpan = req.session.reportingPeriod ?? this.getDateAsIsoString()
    const prisonCode = res.locals.user.getActiveCaseloadId()!
    const stats = await this.keyworkerApiService.getPrisonStats(req, prisonCode, nowSpan.start, nowSpan.end)
    const prison = req.middleware!.prisonConfiguration!
    const hasPreviousStats = stats.previous !== undefined && stats.previous !== null
    const dataUpdateDate = getDateInReadableFormat(new Date().toISOString())
    const prisonName = res.locals.user.caseLoads?.find(caseLoad => caseLoad.caseLoadId === prisonCode)?.description

    const data = this.createPayload(
      stats.current,
      stats.previous,
      prison.hasPrisonersWithHighComplexityNeeds,
      prison.frequencyInWeeks,
    )

    res.render('staff-data/view', {
      showBreadcrumbs: true,
      data,
      dateFrom: formatDateConcise(stats.current?.from),
      dateTo: formatDateConcise(stats.current?.to),
      comparisonDateFrom: formatDateConcise(stats.previous?.from),
      comparisonDateTo: formatDateConcise(stats.previous?.to),
      dataUpdateDate,
      hasPreviousStats,
      prisonName,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.session.reportingPeriod = {
      start: req.body.dateFrom,
      end: req.body.dateTo,
    }
    res.redirect('staff-data')
  }
}
