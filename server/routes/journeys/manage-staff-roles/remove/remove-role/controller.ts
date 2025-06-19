import { NextFunction, Request, Response } from 'express'
import KeyworkerApiService from '../../../../../services/keyworkerApi/keyworkerApiService'

export class ConfirmRemoveRoleController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response) => {
    res.render('manage-staff-roles/remove/remove-role/view', {
      staff: req.journeyData.removeStaffRole!.staff,
      backUrl: '../remove',
    })
  }

  submitToApi = async (req: Request, res: Response, next: NextFunction) => {
    await this.keyworkerApiService.removeRoleFromStaff(req, res, req.journeyData.removeStaffRole!.staff!)
    next()
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('confirmation')
  }
}
