import { NextFunction, Request, Response } from 'express'
import KeyworkerApiService from '../../../../services/keyworkerApi/keyworkerApiService'
import { components } from '../../../../@types/keyWorker'

export class AssignStaffRoleController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

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
          await this.keyworkerApiService.searchStaff(
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
    res.redirect('assign')
  }

  selectStaff = async (req: Request<unknown, unknown, unknown, { staffId?: string }>, res: Response) => {
    const staffId = Number(req.query.staffId)
    const staff = req.journeyData.assignStaffRole!.searchResults?.find(item => item.staffId === staffId)
    if (staff) {
      req.journeyData.assignStaffRole!.staff = staff
      res.redirect('role')
    } else {
      res.redirect('../assign')
    }
  }
}
