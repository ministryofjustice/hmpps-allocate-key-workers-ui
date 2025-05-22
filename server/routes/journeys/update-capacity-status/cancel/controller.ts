import { Request, Response } from 'express'
import KeyworkerApiService from '../../../../services/keyworkerApi/keyworkerApiService'

export class CancelUpdateStatusController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response) => {
    delete req.journeyData.updateCapacityStatus
    req.journeyData.keyWorkerDetails = await this.keyworkerApiService.getKeyworkerDetails(
      req as Request,
      res.locals.user.getActiveCaseloadId()!,
      req.journeyData.keyWorkerDetails!.keyworker.staffId,
    )
    res.redirect('../update-capacity-status')
  }
}
