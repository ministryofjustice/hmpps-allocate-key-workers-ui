import { Request, Response } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import { components } from '../../@types/keyWorker'
import { formatDateConcise } from '../../utils/datetimeUtils'

export class KeyWorkerProfileController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response, staffId: string): Promise<void> => {
    const prisonCode = res.locals.user.activeCaseLoad!.caseLoadId!
    const keyworkerData = await this.keyworkerApiService.getKeyworkerDetails(req, prisonCode, staffId)
    const allocationRecords = this.mapAllocationsToRecords(keyworkerData.allocations)

    res.render('key-worker-profile/view', {
      ...keyworkerData,
      showBreadcrumbs: true,
      records: allocationRecords,
    })
  }

  private mapAllocationsToRecords(allocations: components['schemas']['Allocation'][]) {
    return allocations.map(allocation => {
      const { prisoner } = allocation
      return {
        prisonerId: prisoner.prisonNumber,
        firstName: prisoner.firstName,
        lastName: prisoner.lastName,
        location: prisoner.cellLocation,
        releaseDate: formatDateConcise(prisoner.releaseDate),
        csra: prisoner.csra,
        recentSession: formatDateConcise(allocation.latestSession?.occurredAt),
      }
    })
  }
}
