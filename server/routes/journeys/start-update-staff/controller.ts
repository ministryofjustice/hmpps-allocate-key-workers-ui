import { Request, Response } from 'express'
import KeyworkerApiService from '../../../services/keyworkerApi/keyworkerApiService'

export class StartUpdateStaffController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request<{ staffId: string }, unknown, unknown, { proceedTo: string }>, res: Response) => {
    req.journeyData.staffDetails = await this.keyworkerApiService.getStaffDetails(
      req,
      res.locals.user.getActiveCaseloadId()!,
      req.params.staffId,
      false,
    )

    req.journeyData.b64History = res.locals.b64History

    res.redirect(`../${req.query.proceedTo}`)
  }
}
