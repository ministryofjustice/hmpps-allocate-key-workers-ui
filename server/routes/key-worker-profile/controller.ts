import { Request, Response } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'

export class KeyWorkerProfileController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response, staffId: string): Promise<void> => {
    const prisonCode = res.locals.user.getActiveCaseloadId()!
    const keyworkerData = await this.keyworkerApiService.getKeyworkerDetails(req, prisonCode, staffId)

    res.render('key-worker-profile/view', {
      ...keyworkerData,
      showBreadcrumbs: true,
    })
  }
}
