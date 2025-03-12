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
    const allocations = this.mapAllocations(keyworkerData.allocations)

    res.render('profile-summary/view', {
      keyworkerName,
      keyworkerStatus,
      keyworkerData,
      records: allocations,
    })
  }

  private mapAllocations(allocations: components['schemas']['Allocation'][]) {
    return allocations.map(allocation => {
      return {
        prisonerId: allocation.prisoner.prisonNumber,
        prisonerName: `${allocation.prisoner.firstName} ${allocation.prisoner.lastName}`,
        location: allocation.location,
        releaseDate: allocation.releaseDate ? allocation.releaseDate : '-',
        recentSession: allocation.latestSession?.occurredAt ? allocation.latestSession.occurredAt : '-',
      }
    })
  }
}
