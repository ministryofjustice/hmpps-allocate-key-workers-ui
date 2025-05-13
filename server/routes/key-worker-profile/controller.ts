import { Request, Response } from 'express'
import { ChangeKeyWorkerController } from '../base/changeKeyWorkerController'

export class KeyWorkerProfileController extends ChangeKeyWorkerController {
  GET = async (req: Request, res: Response, staffId: string): Promise<void> => {
    const prisonCode = res.locals.user.getActiveCaseloadId()!
    const keyworkerData = await this.keyworkerApiService.getKeyworkerDetails(req, prisonCode, staffId)

    res.render('key-worker-profile/view', {
      ...keyworkerData,
      ...(await this.getChangeKeyworkerData(req, res)),
      showBreadcrumbs: true,
    })
  }
}
