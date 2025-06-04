import { Request, Response } from 'express'
import KeyworkerApiService from '../../../services/keyworkerApi/keyworkerApiService'
import { setPaginationLocals } from '../../../views/partials/simplePagination/utils'

export class AssignStaffRoleController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response) => {
    req.journeyData.assignStaffRole ??= {}

    if (req.journeyData.assignStaffRole!.query && !req.journeyData.assignStaffRole!.searchResults) {
      req.journeyData.assignStaffRole!.searchResults = (
        await this.keyworkerApiService.searchStaff(req as Request, res, req.journeyData.assignStaffRole.query)
      ).content.map(itm => ({
        staffId: itm.staffId,
        firstName: itm.firstName,
        lastName: itm.lastName,
        username: itm.username,
        email: itm.email,
      }))
    }

    if (req.journeyData.assignStaffRole!.searchResults?.length) {
      setPaginationLocals(
        res,
        Number.MAX_VALUE,
        1,
        req.journeyData.assignStaffRole!.searchResults.length,
        req.journeyData.assignStaffRole!.searchResults.length,
      )
    }

    return res.render('assign-staff-role/view', {
      backUrl: '/',
      query: req.journeyData.assignStaffRole!.query,
      searchResults: req.journeyData.assignStaffRole!.searchResults,
    })
  }

  POST = async (req: Request, res: Response) => {
    req.journeyData.assignStaffRole!.query = req.body.query
    delete req.journeyData.assignStaffRole!.searchResults
    res.redirect('assign-staff-role')
  }

  selectStaff = async (req: Request<unknown, unknown, unknown, { staffId?: string }>, res: Response) => {
    const staffId = Number(req.query.staffId)
    const staff = req.journeyData.assignStaffRole!.searchResults?.find(item => item.staffId === staffId)
    if (staff) {
      req.journeyData.assignStaffRole!.staff = staff
      res.redirect('role')
    } else {
      res.redirect('../assign-staff-role')
    }
  }
}
