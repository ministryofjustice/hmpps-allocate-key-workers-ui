import { Request, Response } from 'express'
import { subMonths, subDays, differenceInDays, format, startOfMonth, endOfMonth } from 'date-fns'
import { ChangeStaffController } from '../base/changeStaffController'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'
import { ResQuerySchemaType } from './schema'

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

  GET = async (req: Request<{ staffId: string }>, res: Response): Promise<void> => {
    res.setAuditDetails.staffId(req.params.staffId)
    res.setAuditDetails.searchTerm(req.params.staffId)

    if (
      res.locals.user.permissions === UserPermissionLevel.SELF_PROFILE_ONLY &&
      req.params.staffId !== String(res.locals.user.userId)
    ) {
      return res.redirect(`/${res.locals.policyPath}/not-authorised`)
    }

    const resQuery = res.locals['query'] as ResQuerySchemaType

    const staffDetails = await this.allocationsApiService.getStaffDetails(
      req,
      res.locals.user.getActiveCaseloadId()!,
      req.params.staffId,
      true,
      this.getDateRange(resQuery),
    )

    return res.render('staff-profile-personal-officer/view', {
      ...staffDetails,
      staffMember: { firstName: staffDetails.firstName, lastName: staffDetails.lastName },
      ...(await this.getChangeData(req, res)),
      showBreadcrumbs: true,
      filterUrl: `${req.baseUrl}/filter`,
      clearFilterUrl: req.baseUrl,
      clearDateRangeUrl:
        resQuery?.compareDateFrom || resQuery?.compareDateTo
          ? `${req.baseUrl}?${new URLSearchParams({
              compareDateTo: resQuery.compareDateTo ?? '',
              compareDateFrom: resQuery.compareDateFrom ?? '',
            }).toString()}`
          : req.baseUrl,
      clearCompareDateRangeUrl:
        resQuery?.dateFrom || resQuery?.dateTo
          ? `${req.baseUrl}?${new URLSearchParams({
              dateFrom: resQuery.dateFrom ?? '',
              dateTo: resQuery.dateTo ?? '',
            }).toString()}`
          : req.baseUrl,
      showFilter: !!resQuery,
      ...resQuery,
      jsEnabled: req.query['js'] === 'true',
    })
  }

  filter = async (req: Request<{ staffId: string }>, res: Response) => {
    res.redirect(
      `../${req.params.staffId}?${new URLSearchParams({
        dateTo: req.body.dateTo,
        dateFrom: req.body.dateFrom,
        compareDateTo: req.body.compareDateTo,
        compareDateFrom: req.body.compareDateFrom,
      }).toString()}`,
    )
  }

  POST = async (req: Request, res: Response) => res.redirect(req.get('Referrer')!)
}
