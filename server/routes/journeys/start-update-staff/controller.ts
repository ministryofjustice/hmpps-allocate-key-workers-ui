import { Request, Response } from 'express'
import AllocationsApiService from '../../../services/allocationsApi/allocationsApiService'

export class StartUpdateStaffController {
  constructor(private readonly allocationsApiService: AllocationsApiService) {}

  GET = async (req: Request<{ staffId: string }, unknown, unknown, { proceedTo: string }>, res: Response) => {
    req.journeyData.staffDetails = await this.allocationsApiService.getStaffDetails(
      req,
      res.locals.user.getActiveCaseloadId()!,
      req.params.staffId,
      false,
    )

    req.journeyData.b64History = res.locals.b64History

    res.redirect(`../${req.query.proceedTo}`)
  }
}
