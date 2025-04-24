import { Request, Response } from 'express'
import PrisonApiService from '../../services/prisonApi/prisonApiService'

export class PrisonerAllocationHistoryController {
  constructor(private readonly prisonerApiService: PrisonApiService) {}

  GET = async (req: Request, res: Response, prisonerId: string): Promise<void> => {
    // const prisonerImage = this.prisonerApiService.getPrisonerImage(req, prisonerId)

    const allocationHistoryRecords : string[] = []
    res.render('prisoner-allocation-history/view',
      allocationHistoryRecords
    )
  }
}
