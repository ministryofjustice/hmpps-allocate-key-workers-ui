import { Request, Response } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'

export class ProfileSummaryController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const prisonId = res.locals.user.activeCaseLoad!.caseLoadId!
    const userId = res.locals.user.userId!

    const keyworkerData = await this.keyworkerApiService.getKeyworkerDetails(req, prisonId, userId)

    res.render('profile-summary/view', {
      keyworkerData,
    })
  }
}
