import { Request, Response } from 'express'
import { subMonths, subDays, differenceInDays, format } from 'date-fns'
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

    const to = new Date()
    const from = subMonths(to, 1)
    const comparisonTo = subDays(from, 1)
    const comparisonFrom = subDays(comparisonTo, differenceInDays(to, from))

    const dateRange = {
      to: format(to, 'yyyy-MM-dd'),
      from: format(from, 'yyyy-MM-dd'),
      comparisonTo: format(comparisonTo, 'yyyy-MM-dd'),
      comparisonFrom: format(comparisonFrom, 'yyyy-MM-dd'),
    }

    const staffDetails = await this.keyworkerApiService.getStaffDetails(
      req,
      res.locals.user.getActiveCaseloadId()!,
      req.params.staffId,
      true,
      dateRange,
    )

    return res.render('staff-profile/view', {
      ...staffDetails,
      staffMember: { firstName: staffDetails.firstName, lastName: staffDetails.lastName },
      ...(await this.getChangeData(req, res)),
      showBreadcrumbs: true,
    })
  }

  POST = async (req: Request, res: Response) => res.redirect(req.get('Referrer')!)
}
