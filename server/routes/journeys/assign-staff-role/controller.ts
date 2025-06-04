import { Request, Response } from 'express'
import KeyworkerApiService from '../../../services/keyworkerApi/keyworkerApiService'

export class AssignStaffRoleController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response) => {
    req.journeyData.assignStaffRole ??= {}

    if (req.journeyData.assignStaffRole!.query && !req.journeyData.assignStaffRole!.searchResults) {
      req.journeyData.assignStaffRole!.searchResults = await this.keyworkerApiService.searchStaff(
        req,
        res,
        req.journeyData.assignStaffRole.query,
      )
    }
    res.render('assign-staff-role/view', {
      query: req.journeyData.assignStaffRole!.query,
      searchResults: req.journeyData.assignStaffRole!.searchResults,
    })
  }

  POST = async (req: Request, res: Response) => {
    req.journeyData.assignStaffRole!.query = req.body.query
    delete req.journeyData.assignStaffRole!.searchResults
    res.redirect('assign-staff-role')
  }
}
