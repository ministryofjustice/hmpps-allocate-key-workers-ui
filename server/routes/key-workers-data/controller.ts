import { Request, Response } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import { components } from '../../@types/keyWorker'
import { formatChange, formatNumber, formatValue } from '../../utils/statsUtils'
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

    const items = {
      keyworkerSessions: { heading: 'Number of recorded key worker sessions', type: 'number' },
      keyworkerEntries: { heading: 'Number of recorded key worker entries', type: 'number' },
      totalPrisoners: { heading: 'Total number of prisoners', type: 'number' },
      highComplexityOfNeedPrisoners: { heading: 'Total number of high complexity prisoners', type: 'number' },
      percentageWithKeyworker: {
        heading: 'Percentage of prisoners with an allocated key worker',
        type: 'percentage',
      },
      activeKeyworkers: { heading: 'Total number of active key workers', type: 'number' },
      avgReceptionToSessionDays: {
        heading: 'Average time from reception to first key worker session',
        type: 'day',
      },
      avgReceptionToAllocationDays: {
        heading: 'Average time from reception to key worker allocation',
        type: 'day',
      },
      compliance: { heading: 'Compliance rate', type: 'percentage' },
      projectedSessions: { heading: 'Number of projected key worker sessions', type: 'number' },
    }

    const nullCheckFields = new Set([
      'percentageWithKeyworker',
      'avgReceptionToAllocationDays',
      'avgReceptionToSessionDays',
    ])

    return Object.entries(items).map(([key, val]) => {
      const currentVal = current[key as keyof components['schemas']['PrisonStats']['current']] as number
      const previousVal = previous
        ? (previous[key as keyof components['schemas']['PrisonStats']['previous']] as number)
        : undefined

      const displayValue =
        nullCheckFields.has(key) && (currentVal == null || previousVal == null)
          ? '-'
          : formatValue(currentVal ?? 0, val.type || 'number')

      const changeValue =
        nullCheckFields.has(key) && (currentVal == null || previousVal == null)
          ? 'No change'
          : formatChange(previousVal ? formatNumber(currentVal - previousVal, val.type) : currentVal || 0, val.type)

      return {
        name: key,
        heading: val.heading,
        value: displayValue,
        change: {
          value: changeValue,
          period: 'period',
        },
        type: val.type || 'number',
      }
    })
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
