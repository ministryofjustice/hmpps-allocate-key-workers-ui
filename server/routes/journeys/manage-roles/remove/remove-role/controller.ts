import { NextFunction, Request, Response } from 'express'
import AllocationsApiService from '../../../../../services/allocationsApi/allocationsApiService'

export class ConfirmRemoveRoleController {
  constructor(private readonly allocationsApiService: AllocationsApiService) {}

  GET = async (req: Request, res: Response) => {
    res.render('manage-roles/remove/remove-role/view', {
      staff: req.journeyData.removeStaffRole!.staff,
      backUrl: '../remove',
    })
  }

  submitToApi = async (req: Request, res: Response, next: NextFunction) => {
    await this.allocationsApiService.deleteStaffDetails(req, res, req.journeyData.removeStaffRole!.staff!.staffId)
    next()
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('confirmation')
  }
}
