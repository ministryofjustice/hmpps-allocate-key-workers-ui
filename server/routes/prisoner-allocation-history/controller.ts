import { Request, Response } from 'express'
import PrisonerSearchApiService from '../../services/prisonerSearch/prisonerSearchApiService'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'

export class PrisonerAllocationHistoryController {
  constructor(
    private readonly prisonerSearchApiService: PrisonerSearchApiService,
    private readonly keyworkerApiService: KeyworkerApiService,
  ) {}

  GET = async (req: Request, res: Response, prisonerId: string): Promise<void> => {
    const prisoner = await this.prisonerSearchApiService.getPrisonerDetails(req, prisonerId)
    const keyworkerAllocations = await this.keyworkerApiService.getKeyworkerAllocations(req, prisonerId)

    res.render('prisoner-allocation-history/view', {
      prisoner,
      allocationHistory: keyworkerAllocations.allocations,
      backUrl: '/allocate-key-workers',
    })
  }
}
