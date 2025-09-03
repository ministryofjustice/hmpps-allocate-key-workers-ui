import { Request, Response } from 'express'
import { subMonths, subDays, differenceInDays, format } from 'date-fns'
import { ChangeStaffController } from '../base/changeStaffController'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'
import { prisonerProfileBacklink } from '../../utils/utils'

export class StaffProfileController extends ChangeStaffController {
  GET_BASE =
    (view: string, withCaseNotes: boolean) =>
    async (req: Request<{ staffId: string }>, res: Response): Promise<void> => {
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

      const staffDetails = await this.allocationsApiService.getStaffDetails(
        req,
        res.locals.user.getActiveCaseloadId()!,
        req.params.staffId,
        true,
        dateRange,
      )

      return res.render(view, {
        ...staffDetails,
        allocations: staffDetails.allocations.map(a => {
          return {
            ...a,
            profileHref: prisonerProfileBacklink(req, res, a.prisoner.prisonNumber),
            alertsHref: prisonerProfileBacklink(req, res, a.prisoner.prisonNumber, '/alerts/active'),
          }
        }),
        staffMember: { firstName: staffDetails.firstName, lastName: staffDetails.lastName },
        ...(await this.getChangeData(req, res)),
        showBreadcrumbs: true,
        jsEnabled: req.query['js'] === 'true',
        sort: req.query['sort'],
        caseNotes:
          withCaseNotes &&
          (
            await this.allocationsApiService.searchRecordedEvents(
              req,
              res,
              req.params.staffId,
              dateRange.from,
              dateRange.to,
            )
          ).recordedEvents.sort(this.getCaseNoteSorter(req.query['sort'] as string)),
      })
    }

  GET = this.GET_BASE('staff-profile/view', false)

  GET_CASE_NOTES = this.GET_BASE('staff-profile/case-notes/view', true)

  POST = async (req: Request, res: Response) => res.redirect(req.get('Referrer')!)
}
