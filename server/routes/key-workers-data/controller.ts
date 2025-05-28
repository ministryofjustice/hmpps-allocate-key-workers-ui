import { Request, Response } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import { components } from '../../@types/keyWorker'
import { FLASH_KEY__FORM_RESPONSES } from '../../utils/constants'
import { formatDateConcise } from '../../utils/datetimeUtils'

export class KeyWorkersDataController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  private getLastFullMonthAsIsoDateString = () => {
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const firstDay = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1)
    const lastDay = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0)

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
  ) => {
    if (!current) return []

    const items = this.createStatsItems(current, previous)

    return Object.entries(items).map(([key, val]) => {
      return {
        name: key,
        heading: val.heading,
        currentValue: val.currentValue,
        previousValue: val.previousValue,
        type: val.type || 'number',
      }
    })
  }

  private createStatsItems(
    current: components['schemas']['PrisonStats']['current'],
    previous: components['schemas']['PrisonStats']['previous'],
  ) {
    return {
      keyworkerSessions: {
        heading: 'Number of recorded key worker sessions',
        type: 'number',
        currentValue: current?.keyworkerSessions,
        previousValue: previous?.keyworkerSessions,
      },
      keyworkerEntries: {
        heading: 'Number of recorded key worker entries',
        type: 'number',
        currentValue: current?.keyworkerEntries,
        previousValue: previous?.keyworkerEntries,
      },
      totalPrisoners: {
        heading: 'Total number of prisoners',
        type: 'number',
        currentValue: current?.totalPrisoners,
        previousValue: previous?.totalPrisoners,
      },
      highComplexityOfNeedPrisoners: {
        heading: 'Total number of high complexity prisoners',
        type: 'number',
        currentValue: current?.highComplexityOfNeedPrisoners,
        previousValue: previous?.highComplexityOfNeedPrisoners,
      },
      percentageWithKeyworker: {
        heading: 'Percentage of prisoners with an allocated key worker',
        type: 'percentage',
        currentValue: current?.percentageWithKeyworker,
        previousValue: previous?.percentageWithKeyworker,
      },
      activeKeyworkers: {
        heading: 'Total number of active key workers',
        type: 'number',
        currentValue: current?.activeKeyworkers,
        previousValue: previous?.activeKeyworkers,
      },
      avgReceptionToSessionDays: {
        heading: 'Average time from reception to first key worker session',
        type: 'day',
        currentValue: current?.avgReceptionToSessionDays,
        previousValue: previous?.avgReceptionToSessionDays,
      },
      avgReceptionToAllocationDays: {
        heading: 'Average time from reception to key worker allocation',
        type: 'day',
        currentValue: current?.avgReceptionToAllocationDays,
        previousValue: previous?.avgReceptionToAllocationDays,
      },
      compliance: {
        heading: 'Compliance rate',
        type: 'percentage',
        currentValue: current?.compliance,
        previousValue: previous?.compliance,
      },
      projectedSessions: {
        heading: 'Number of projected key worker sessions',
        type: 'number',
        currentValue: current?.projectedSessions,
        previousValue: previous?.projectedSessions,
      },
    }
  }

  GET = async (req: Request, res: Response) => {
    const nowSpan = res.locals[FLASH_KEY__FORM_RESPONSES]?.nowSpan || this.getLastFullMonthAsIsoDateString()
    const previousSpan = this.getComparisonDates(nowSpan.start, nowSpan.end)
    const prisonCode = res.locals.user.getActiveCaseloadId()!
    const stats = await this.keyworkerApiService.getPrisonStats(req, prisonCode, nowSpan.start, nowSpan.end)
    const prison = await this.keyworkerApiService.getPrisonConfig(req, prisonCode)
    const hasCurrentStats = stats.current !== undefined && stats.current !== null
    const hasPreviousStats = stats.previous !== undefined && stats.previous !== null

    const data = this.createPayload(stats.current, stats.previous)

    res.render('key-workers-data/view', {
      showBreadcrumbs: true,
      data,
      dateFrom: formatDateConcise(nowSpan.start),
      dateTo: formatDateConcise(nowSpan.end),
    })
  }

  POST = async (req: Request, res: Response) => {
    req.flash(
      FLASH_KEY__FORM_RESPONSES,
      JSON.stringify({ nowSpan: { start: req.body.dateFrom, end: req.body.dateTo } }),
    )

    res.redirect('/key-workers-data')
  }
}
