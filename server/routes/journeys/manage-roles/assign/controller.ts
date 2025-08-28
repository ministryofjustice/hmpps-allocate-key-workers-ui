import { NextFunction, Request, Response } from 'express'
import AllocationsApiService from '../../../../services/allocationsApi/allocationsApiService'
import { components } from '../../../../@types/keyWorker'
import { getHistoryParamForPOST } from '../../../../middleware/historyMiddleware'

export class AssignStaffRoleController {
  constructor(private readonly allocationsApiService: AllocationsApiService) {}

  GET = async (req: Request, res: Response, next: NextFunction) => {
    req.journeyData.assignStaffRole ??= {}

    if (req.journeyData.assignStaffRole.query) {
      res.setAuditDetails.searchTerm(req.journeyData.assignStaffRole.query)
    }

    if (req.journeyData.assignStaffRole!.query && !req.journeyData.assignStaffRole!.searchResults) {
      try {
        const searchOptions: components['schemas']['StaffSearchRequest'] = {
          query: req.journeyData.assignStaffRole!.query,
          status: 'ALL',
          hasPolicyStaffRole: false,
        }
        req.journeyData.assignStaffRole!.searchResults = (
          await this.allocationsApiService.searchStaff(
            req as Request,
            res.locals.user.getActiveCaseloadId()!,
            searchOptions,
          )
        ).map(itm => ({
          staffId: itm.staffId,
          firstName: itm.firstName,
          lastName: itm.lastName,
          username: itm.username,
          email: itm.email,
        }))
      } catch (e) {
        req.journeyData.assignStaffRole!.searchResults = []
        return next(e)
      }
    }

    return res.render('manage-roles/assign/view', {
      showBreadcrumbs: true,
      query: req.journeyData.assignStaffRole!.query,
      searchResults: req.journeyData.assignStaffRole!.searchResults,
    })
  }

  POST = async (req: Request, res: Response) => {
    req.journeyData.assignStaffRole!.query = req.body.query
    delete req.journeyData.assignStaffRole!.searchResults
    res.redirect(`assign?history=${getHistoryParamForPOST(req)}`)
  }

  selectStaff = async (req: Request<unknown, unknown, unknown, { staffId?: string }>, res: Response) => {
    const staffId = Number(req.query.staffId)
    const staff = req.journeyData.assignStaffRole!.searchResults?.find(item => item.staffId === staffId)
    if (!staff) {
      return res.redirect('../assign')
    }
    req.journeyData.assignStaffRole!.staff = staff
    req.journeyData.b64History = getHistoryParamForPOST(req as Request)
    return res.redirect(res.locals['policyPath'] === 'personal-officer' ? 'working-pattern' : 'role')
  }
}
