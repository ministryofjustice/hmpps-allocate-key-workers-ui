import { Request, Response } from 'express'
import { ChangeStaffController } from '../base/changeStaffController'

export class StaffProfileController extends ChangeStaffController {
  GET = async (req: Request<{ staffId: string }>, res: Response): Promise<void> => {
    const prisonCode = res.locals.user.getActiveCaseloadId()!
    const keyworkerData = await this.keyworkerApiService.getStaffDetails(req, prisonCode, req.params.staffId)

    res.render('staff-profile/view', {
      ...{ ...keyworkerData, keyworker: { firstName: keyworkerData.firstName, lastName: keyworkerData.lastName } },
      ...(await this.getChangeKeyworkerData(req, res)),
      showBreadcrumbs: true,
    })
  }

  POST = async (req: Request, res: Response) => res.redirect(req.get('Referrer')!)
}
