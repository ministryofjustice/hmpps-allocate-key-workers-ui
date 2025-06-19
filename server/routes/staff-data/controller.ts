import { Request, Response } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import { components } from '../../@types/keyWorker'
import { FLASH_KEY__FORM_RESPONSES } from '../../utils/constants'
import { formatDateConcise, getDateInReadableFormat } from '../../utils/datetimeUtils'

export class StaffDataController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  private getDateAsIsoString = () => {
    const lastDay = new Date()
    lastDay.setDate(lastDay.getDate() - 1)

    const daysInMonth = new Date(lastDay.getFullYear(), lastDay.getMonth() + 1, 0).getDate()
    const firstDay = new Date(lastDay)
    firstDay.setDate(lastDay.getDate() - daysInMonth)

    return { start: firstDay.toISOString().substring(0, 10), end: lastDay.toISOString().substring(0, 10) }
  }

  private getComparisonDates = (fromDate: string, toDate: string) => {
    const fromDateDate = new Date(fromDate)
    const toDateDate = new Date(toDate)
    const diff = Math.abs(toDateDate.getTime() - fromDateDate.getTime())
    const diffAsDays = Math.floor(diff / (1000 * 3600 * 24))

    const newFromDate = new Date(fromDateDate.getTime() - diffAsDays * 24 * 60 * 60 * 1000)
    const newToDate = new Date(fromDateDate.getTime() - 24 * 60 * 60 * 1000)

    return { start: newFromDate.toISOString().substring(0, 10), end: newToDate.toISOString().substring(0, 10) }
  }

  private createPayload = (
    current: components['schemas']['PrisonStats']['current'],
    previous: components['schemas']['PrisonStats']['previous'],
    hasHighComplexityPrisoners: boolean,
    kwSessionFrequencyInWeeks: number,
  ) => {
    if (!current) return []

    const items = this.createStatsItems(current, previous, kwSessionFrequencyInWeeks)

    return Object.entries(items).map(([key, val]) => {
      return {
        name: key,
        heading: val.heading,
        currentValue: val.currentValue,
        previousValue: val.previousValue,
        type: val.type || 'number',
        calculationMethod: val.calculationMethod,
        isHidden: key === 'highComplexityOfNeedPrisoners' && !hasHighComplexityPrisoners,
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
    const nowSpan =
      res.locals.formResponses?.['start'] && res.locals.formResponses?.['end']
        ? res.locals.formResponses
        : this.getDateAsIsoString()
    const previousSpan = this.getComparisonDates(nowSpan.start, nowSpan.end)
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
      dateFrom: formatDateConcise(nowSpan.start),
      dateTo: formatDateConcise(nowSpan.end),
      comparisonDateFrom: formatDateConcise(previousSpan.start),
      comparisonDateTo: formatDateConcise(previousSpan.end),
      dataUpdateDate,
      hasPreviousStats,
      prisonName,
    })
  }

  POST = async (req: Request, res: Response) => {
    req.flash(FLASH_KEY__FORM_RESPONSES, JSON.stringify({ start: req.body.dateFrom, end: req.body.dateTo }))

    res.redirect('staff-data')
  }
}
