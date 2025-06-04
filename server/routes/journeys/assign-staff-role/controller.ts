import { Request, Response } from 'express'
import KeyworkerApiService from '../../../services/keyworkerApi/keyworkerApiService'
import { setPaginationLocals } from '../../../views/partials/simplePagination/utils'

export class AssignStaffRoleController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  private ITEMS_PER_PAGE = 20

  GET = async (req: Request<unknown, unknown, unknown, { page?: string }>, res: Response) => {
    req.journeyData.assignStaffRole ??= {}

    if (req.query.page) {
      const queryPage = Number(req.query.page)
      if (!Number.isNaN(queryPage)) {
        req.journeyData.assignStaffRole!.page = queryPage
      }
      return res.redirect('assign-staff-role')
    }

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

    const page = req.journeyData.assignStaffRole!.page ?? 1
    const searchResults = req.journeyData.assignStaffRole!.searchResults?.slice(
      (page - 1) * this.ITEMS_PER_PAGE,
      page * this.ITEMS_PER_PAGE,
    )

    if (req.journeyData.assignStaffRole!.searchResults?.length) {
      setPaginationLocals(
        res,
        this.ITEMS_PER_PAGE,
        page,
        req.journeyData.assignStaffRole!.searchResults.length,
        searchResults!.length,
      )
    }

    return res.render('assign-staff-role/view', {
      query: req.journeyData.assignStaffRole!.query,
      searchResults,
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
