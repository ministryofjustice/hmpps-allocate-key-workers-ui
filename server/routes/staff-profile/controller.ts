import { Request, Response } from 'express'
import { ChangeStaffController } from '../base/changeStaffController'

export class StaffProfileController extends ChangeStaffController {
  GET = async (req: Request<{ staffId: string }>, res: Response): Promise<void> => {
    const prisonCode = res.locals.user.getActiveCaseloadId()!
    const staffData = await this.keyworkerApiService.getStaffDetails(req, prisonCode, req.params.staffId)

    res.render('staff-profile/view', {
      ...{ ...staffData, staffMember: { firstName: staffData.firstName, lastName: staffData.lastName } },
      ...(await this.getChangeStaffData(req, res)),
      showBreadcrumbs: true,
    })
  }

  POST = async (req: Request, res: Response) => res.redirect(req.get('Referrer')!)
}
