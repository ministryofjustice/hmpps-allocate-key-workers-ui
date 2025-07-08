import { Request, Response } from 'express'
import KeyworkerApiService from '../../../../services/keyworkerApi/keyworkerApiService'
import { resetJourneyAndReloadKeyWorkerDetails } from '../common/utils'

export class CancelUpdateStatusController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response) => {
    await resetJourneyAndReloadKeyWorkerDetails(this.keyworkerApiService, req, res)
    res.redirect('../update-capacity-status-and-working-pattern')
  }
}
