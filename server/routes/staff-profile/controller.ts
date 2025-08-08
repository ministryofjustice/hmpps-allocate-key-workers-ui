import { Request, Response } from 'express'
import { ChangeStaffController } from '../base/changeStaffController'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'

export class StaffProfileController extends ChangeStaffController {
  GET = async (req: Request<{ staffId: string }>, res: Response): Promise<void> => {
    res.setAuditDetails.staffId(req.params.staffId)
    res.setAuditDetails.searchTerm(req.params.staffId)

    if (
      res.locals.user.permissions === UserPermissionLevel.SELF_PROFILE_ONLY &&
      req.params.staffId !== String(res.locals.user.userId)
    ) {
      return res.redirect(`/${res.locals.policyPath}/not-authorised`)
    }
    const prisonCode = res.locals.user.getActiveCaseloadId()!
    const Data = await this.keyworkerApiService.getStaffDetails(req, prisonCode, req.params.staffId, true)

    return res.render('staff-profile/view', {
      ...{ ...Data, staffMember: { firstName: Data.firstName, lastName: Data.lastName } },
      ...(await this.getChangeData(req, res)),
      showBreadcrumbs: true,
    })
  }

  POST = async (req: Request, res: Response) => res.redirect(req.get('Referrer')!)
}
