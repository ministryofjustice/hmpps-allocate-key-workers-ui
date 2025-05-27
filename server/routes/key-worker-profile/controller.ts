import { Request, Response } from 'express'
import { ChangeKeyWorkerController } from '../base/changeKeyWorkerController'

export class KeyWorkerProfileController extends ChangeKeyWorkerController {
  GET = async (req: Request<{ staffId: string }>, res: Response): Promise<void> => {
    const prisonCode = res.locals.user.getActiveCaseloadId()!
    const keyworkerData = await this.keyworkerApiService.getKeyworkerDetails(req, prisonCode, req.params.staffId)

    res.render('key-worker-profile/view', {
      ...keyworkerData,
      ...(await this.getChangeKeyworkerData(req, res)),
      showBreadcrumbs: true,
    })
  }
}
