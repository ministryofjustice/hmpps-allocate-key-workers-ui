import { Request, Response } from 'express'
import { subMonths, subDays, differenceInDays, format, startOfMonth, endOfMonth } from 'date-fns'
import { ChangeStaffController } from '../base/changeStaffController'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'
import { ResQuerySchemaType } from './schema'
import { prisonerProfileBacklink } from '../../utils/utils'

export class POStaffProfileController extends ChangeStaffController {
  private getDateRange = (query?: ResQuerySchemaType) => {
    if (query?.validated) {
      const { dateFrom, dateTo, compareDateFrom, compareDateTo } = query.validated
      if (dateFrom && dateTo && compareDateFrom && compareDateTo)
        return { from: dateFrom, to: dateTo, comparisonFrom: compareDateFrom, comparisonTo: compareDateTo }
      if (dateFrom && dateTo) {
        const to = new Date(dateTo)
        const from = new Date(dateFrom)
        const comparisonTo = subDays(from, 1)
        const comparisonFrom = subDays(comparisonTo, differenceInDays(to, from))
        return {
          to: format(to, 'yyyy-MM-dd'),
          from: format(from, 'yyyy-MM-dd'),
          comparisonTo: format(comparisonTo, 'yyyy-MM-dd'),
          comparisonFrom: format(comparisonFrom, 'yyyy-MM-dd'),
        }
      }
    }

    return this.defaultDateRange()
  }

  private defaultDateRange = () => {
    const lastDay = new Date()
    const firstDay = startOfMonth(lastDay)
    const previousMonth = subMonths(firstDay, 1)

    return {
      from: format(firstDay, 'yyyy-MM-dd'),
      to: format(lastDay, 'yyyy-MM-dd'),
      comparisonFrom: format(startOfMonth(previousMonth), 'yyyy-MM-dd'),
      comparisonTo: format(endOfMonth(previousMonth), 'yyyy-MM-dd'),
    }
  }

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

      const resQuery = res.locals['query'] as ResQuerySchemaType

      const dateRange = this.getDateRange(resQuery)

      const staffDetails = await this.allocationsApiService.getStaffDetails(
        req,
        res.locals.user.getActiveCaseloadId()!,
        req.params.staffId,
        true,
        dateRange,
      )

      const basePath = req.path.length > 1 ? req.baseUrl + req.path : req.baseUrl

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
        clearFilterUrl: `${basePath}?${new URLSearchParams({
          ...(req.query['sort'] ? { sort: req.query['sort'] as string } : {}),
          ...(req.query['history'] ? { history: req.query['history'] as string } : {}),
        }).toString()}`,
        clearDateRangeUrl:
          resQuery?.compareDateFrom || resQuery?.compareDateTo
            ? `${basePath}?${new URLSearchParams({
                compareDateTo: resQuery.compareDateTo ?? '',
                compareDateFrom: resQuery.compareDateFrom ?? '',
                ...(req.query['sort'] ? { sort: req.query['sort'] as string } : {}),
                ...(req.query['history'] ? { history: req.query['history'] as string } : {}),
              }).toString()}`
            : basePath,
        clearCompareDateRangeUrl:
          resQuery?.dateFrom || resQuery?.dateTo
            ? `${basePath}?${new URLSearchParams({
                dateFrom: resQuery.dateFrom ?? '',
                dateTo: resQuery.dateTo ?? '',
                ...(req.query['sort'] ? { sort: req.query['sort'] as string } : {}),
                ...(req.query['history'] ? { history: req.query['history'] as string } : {}),
              }).toString()}`
            : basePath,
        showFilter: !!resQuery,
        ...resQuery,
        jsEnabled: req.query['js'] === 'true',
        sort: req.query['sort'],
        query: req.query,
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
          ).recordedEvents
            .sort(this.getCaseNoteSorter(req.query['sort'] as string))
            .map(caseNote => ({
              ...caseNote,
              profileHref: prisonerProfileBacklink(req, res, caseNote.prisoner.prisonerNumber),
            })),
      })
    }

  GET = this.GET_BASE('staff-profile-personal-officer/view', false)

  GET_CASE_NOTES = this.GET_BASE('staff-profile-personal-officer/case-notes/view', true)

  POST = async (req: Request, res: Response) => res.redirect(req.get('Referrer')!)
}
