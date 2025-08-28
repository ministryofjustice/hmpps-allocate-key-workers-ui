import { Request, Response } from 'express'
import AllocationsApiService from '../../../../services/allocationsApi/allocationsApiService'
import { resetJourneyAndReloadKeyWorkerDetails } from '../common/utils'

export class CancelUpdateStatusController {
  constructor(private readonly allocationsApiService: AllocationsApiService) {}

  GET = async (req: Request, res: Response) => {
    await resetJourneyAndReloadKeyWorkerDetails(this.allocationsApiService, req, res)
    res.redirect('../update-capacity-status-and-working-pattern')
  }
}
