import { Request, Response } from 'express'
import { ChangeStaffController } from '../base/changeStaffController'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'

export class StaffProfileController extends ChangeStaffController {
  GET = async (req: Request<{ staffId: string }>, res: Response): Promise<void> => {
    if (
      res.locals.user.permissions === UserPermissionLevel.SELF_PROFILE_ONLY &&
      req.params.staffId !== String(res.locals.user.userId)
    ) {
      res.status(403)
      res.render('not-authorised', { showBreadcrumbs: true })
      return
    }
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
