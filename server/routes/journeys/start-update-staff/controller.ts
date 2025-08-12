import { Request, Response } from 'express'
import KeyworkerApiService from '../../../services/keyworkerApi/keyworkerApiService'
import { serialiseHistory } from '../../../middleware/historyMiddleware'

export class StartUpdateStaffController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request<{ staffId: string }, unknown, unknown, { history: string }>, res: Response) => {
    req.journeyData.staffDetails = await this.keyworkerApiService.getStaffDetails(
      req,
      res.locals.user.getActiveCaseloadId()!,
      req.params.staffId,
      false,
    )

    const uuid = req.originalUrl.split('/')[2]
    const proceedTo = `/${res.locals.policyPath}/${uuid}/update-capacity-status-and-working-pattern`
    const newHistory = serialiseHistory([...res.locals.history!, proceedTo])
    res.redirect(`${proceedTo}?history=${newHistory}`)
  }
}
