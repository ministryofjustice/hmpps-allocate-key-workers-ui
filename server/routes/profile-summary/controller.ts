import { Request, Response } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import { components } from '../../@types/keyWorker'

export class ProfileSummaryController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const prisonId = res.locals.user.activeCaseLoad!.caseLoadId!
    const userId = res.locals.user.userId!

    const keyworkerData = await this.keyworkerApiService.getKeyworkerDetails(req, prisonId, userId)
    const keyworkerName = `${keyworkerData.keyworker.firstName} ${keyworkerData.keyworker.lastName}`
    const keyworkerStatus = keyworkerData.status.description
    const allocationRecords = this.mapAllocationsToRecords(keyworkerData.allocations)
    const keyworkerStats = this.formatStats(keyworkerData.stats.current, keyworkerData.stats.previous)

    res.render('profile-summary/view', {
      keyworkerName,
      keyworkerStatus,
      stats: keyworkerStats,
      keyworkerData,
      records: allocationRecords,
    })
  }

  private mapAllocationsToRecords(allocations: components['schemas']['Allocation'][]) {
    return allocations.map(allocation => {
      return {
        prisonerId: allocation.prisoner.prisonNumber,
        firstName: allocation.prisoner.firstName,
        lastName: allocation.prisoner.lastName,
        location: allocation.location,
        csra: allocation.prisoner.csra ? allocation.prisoner.csra : '-',
        releaseDate: allocation.releaseDate ? allocation.releaseDate : '-',
        recentSession: allocation.latestSession?.occurredAt ? allocation.latestSession.occurredAt : '-',
      }
    })
  }

  private formatStats = (
    current: components['schemas']['KeyworkerStats']['current'],
    previous: components['schemas']['KeyworkerStats']['previous'],
  ) => {
    if (!current) return []

    const items = {
      projectedSessions: { heading: 'Projected sessions', type: 'number' },
      recordedSessions: {
        heading: 'Recorded sessions',
        type: 'number',
      },
      complianceRate: {
        heading: 'Session compliance',
        type: 'percentage',
      },
      recordedEntries: {
        heading: 'Case notes written',
        type: 'number',
      },
    }

    return Object.entries(items).map(([key, val]) => {
      const currentVal = current[key as keyof components['schemas']['KeyworkerStats']['current']] as number
      const previousVal = previous
        ? (previous[key as keyof components['schemas']['KeyworkerStats']['previous']] as number)
        : undefined

      return {
        name: key,
        heading: val.heading,
        value: formatValue(currentVal, val.type || 'number'),
        change: {
          value: formatChange(
            previousVal ? formatNumber(currentVal - previousVal, val.type) : currentVal || 0,
            val.type,
          ),
          period: 'period',
        },
        type: val.type || 'number',
      }
    })
  }
}

function formatNumber(value: string | number, type?: string) {
  if (type === 'percentage') return Number(parseFloat(value.toString()).toFixed(2))
  return Number(value)
}

function formatValue(value: number, type: string) {
  if (type === 'percentage') return `${value} %`
  if (value === 0) return 0
  if (!value) return '-'
  return Number(value)
}

function formatChange(change: number, type: string) {
  const formatted = formatValue(change, type)
  if (change > 0) return `+${formatted} increase`
  if (change < 0) return `${formatted} decrease`
  if (change === 0) return 'No change'
  return formatted
}
