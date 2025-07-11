import { NextFunction, Request, Response } from 'express'
import KeyworkerApiService from '../../../../services/keyworkerApi/keyworkerApiService'
import { components } from '../../../../@types/keyWorker'

export class RemoveStaffRoleController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response, next: NextFunction) => {
    req.journeyData.removeStaffRole ??= {}

    if (req.journeyData.removeStaffRole.query) {
      res.setAuditDetails.searchTerm(req.journeyData.removeStaffRole.query)
    }

    if (req.journeyData.removeStaffRole!.query && !req.journeyData.removeStaffRole!.searchResults) {
      try {
        const searchOptions: components['schemas']['StaffSearchRequest'] = {
          query: req.journeyData.removeStaffRole!.query,
          status: 'ALL',
          hasPolicyStaffRole: true,
        }
        req.journeyData.removeStaffRole!.searchResults = (
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
          allocated: itm.allocated,
          staffRole: itm.staffRole!,
        }))
      } catch (e) {
        req.journeyData.removeStaffRole!.searchResults = []
        return next(e)
      }
    }

    return res.render('manage-roles/remove/view', {
      showBreadcrumbs: true,
      query: req.journeyData.removeStaffRole!.query,
      searchResults: req.journeyData.removeStaffRole!.searchResults,
    })
  }

  POST = async (req: Request, res: Response) => {
    req.journeyData.removeStaffRole!.query = req.body.query
    delete req.journeyData.removeStaffRole!.searchResults
    res.redirect('remove')
  }

  selectStaff = async (req: Request<unknown, unknown, unknown, { staffId?: string }>, res: Response) => {
    const staffId = Number(req.query.staffId)
    const staff = req.journeyData.removeStaffRole!.searchResults?.find(item => item.staffId === staffId)
    if (staff) {
      req.journeyData.removeStaffRole!.staff = staff
      res.redirect('remove-role')
    } else {
      res.redirect('../remove')
    }
  }
}
