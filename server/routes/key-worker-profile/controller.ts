import { Request, Response } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import { components } from '../../@types/keyWorker'
import { formatDateConcise } from '../../utils/datetimeUtils'
import { formatChange, formatNumber, formatValue } from '../../utils/statsUtils'

interface AllocationRecord {
  prisonerId: string
  firstName: string
  lastName: string
  location: string
  releaseDate: string | undefined
  csra: string
  recentSession: string | undefined
}

interface DetailRecord {
  heading: string
  value: string | number
}

export class KeyWorkerProfileController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response, staffId: string): Promise<void> => {
    const prisonCode = res.locals.user.activeCaseLoad!.caseLoadId!

    const keyworkerData = await this.keyworkerApiService.getKeyworkerDetails(req, prisonCode, staffId)

    const keyworkerName = `${keyworkerData.keyworker.firstName} ${keyworkerData.keyworker.lastName}`
    const keyworkerStatus = keyworkerData.status.description
    const keyworkerDetails = this.formatDetails(keyworkerData)
    const keyworkerStats = this.formatStats(keyworkerData.stats.current, keyworkerData.stats.previous)
    const allocationRecords = this.mapAllocationsToRecords(keyworkerData.allocations)

    res.render('key-worker-profile/view', {
      keyworkerName,
      keyworkerStatus,
      keyworkerDetails,
      showBreadcrumbs: true,
      dateFrom: formatDateConcise(keyworkerData.stats.previous?.from),
      dateTo: formatDateConcise(keyworkerData.stats.previous?.to),
      statistics: keyworkerStats,
      records: allocationRecords,
    })
  }

  private mapAllocationsToRecords(allocations: components['schemas']['Allocation'][]): AllocationRecord[] {
    return allocations.map(allocation => {
      return {
        prisonerId: allocation.prisoner.prisonNumber,
        firstName: allocation.prisoner.firstName,
        lastName: allocation.prisoner.lastName,
        location: allocation.location,
        releaseDate: allocation.releaseDate ? formatDateConcise(allocation.releaseDate) : '-',
        csra: allocation.prisoner.csra ? allocation.prisoner.csra : '-',
        recentSession: allocation.latestSession?.occurredAt
          ? formatDateConcise(allocation.latestSession.occurredAt)
          : '-',
      }
    })
  }

  private formatDetails(details: components['schemas']['KeyworkerDetails']): DetailRecord[] {
    return [
      {
        heading: 'Establishment',
        value: details.prison.description,
      },
      {
        heading: 'Schedule type',
        value: details.keyworker.scheduleType.description,
      },
      {
        heading: 'Prisoners allocated',
        value: details.allocated,
      },
      {
        heading: 'Maximum capacity',
        value: details.capacity,
      },
    ]
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
