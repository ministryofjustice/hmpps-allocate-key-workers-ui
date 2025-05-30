import { Request, Response } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import { components } from '../../@types/keyWorker'
import { FLASH_KEY__FORM_RESPONSES } from '../../utils/constants'
import { formatDateConcise, getDateInReadableFormat } from '../../utils/datetimeUtils'

export class KeyWorkersDataController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  private getDateAsIsoString = () => {
    const currentDate = new Date()
    currentDate.setDate(currentDate.getDate() - 1)

    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate() + 1)

    return { start: firstDay.toISOString().substring(0, 10), end: currentDate.toISOString().substring(0, 10) }
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
        heading: 'Number of recorded key worker sessions',
        type: 'number',
        currentValue: current?.keyworkerSessions,
        previousValue: previous?.keyworkerSessions,
        calculationMethod:
          'This figure is calculated by taking the total number of key worker session case notes created in the selected date range.',
      },
      keyworkerEntries: {
        heading: 'Number of recorded key worker entries',
        type: 'number',
        currentValue: current?.keyworkerEntries,
        previousValue: previous?.keyworkerEntries,
        calculationMethod:
          'This figure is calculated by taking the total number of key worker entry case notes created in the selected date range.',
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
        heading: 'Percentage of prisoners with an allocated key worker',
        type: 'percentage',
        currentValue: current?.percentageWithKeyworker,
        previousValue: previous?.percentageWithKeyworker,
        calculationMethod:
          'This figure is created by dividing the total number of prisoners in the establishment with the total number of prisoners who have been allocated a key worker.',
      },
      activeKeyworkers: {
        heading: 'Total number of active key workers',
        type: 'number',
        currentValue: current?.activeKeyworkers,
        previousValue: previous?.activeKeyworkers,
        calculationMethod:
          'This figure displays the average total number of active key workers in the establishment during the date range selected. This does not include key workers with an unavailable or inactive status.',
      },
      avgReceptionToSessionDays: {
        heading: 'Average time from reception to first key worker session',
        type: 'day',
        currentValue: current?.avgReceptionToSessionDays,
        previousValue: previous?.avgReceptionToSessionDays,
        calculationMethod:
          'The reception date is calculated by taking the date from the latest instance of a transfer case note for the prisoner within the last 6 months. \n' +
          '\n' +
          'The first key worker session is taken from the date of the first key worker session case note added in the prison in the last 6 months. ',
      },
      avgReceptionToAllocationDays: {
        heading: 'Average time from reception to key worker allocation',
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
          'This figure is calculated by comparing the number of recorded key worker sessions against the number of projected key worker sessions.\n' +
          '\n' +
          'The number of projected key worker sessions is calculated by taking the total number of prisoners with an allocated key worker and comparing it to the expected frequency of key worker sessions in the establishment.',
      },
      projectedSessions: {
        heading: 'Number of projected key worker sessions',
        type: 'number',
        currentValue: current?.projectedSessions,
        previousValue: previous?.projectedSessions,
        calculationMethod:
          'This figure is calculated by taking the total number of prisoners with an allocated key worker and comparing it to the expected frequency of key worker sessions in the establishment.',
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
    const prison = await this.keyworkerApiService.getPrisonConfig(req, prisonCode)
    const hasPreviousStats = stats.previous !== undefined && stats.previous !== null
    const dataUpdateDate = getDateInReadableFormat(new Date().toISOString())
    const prisonName = res.locals.user.caseLoads?.find(caseLoad => caseLoad.caseLoadId === prisonCode)?.description

    const data = this.createPayload(
      stats.current,
      stats.previous,
      prison.hasPrisonersWithHighComplexityNeeds,
      prison.kwSessionFrequencyInWeeks,
    )

    res.render('key-workers-data/view', {
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

    res.redirect('/key-workers-data')
  }
}
