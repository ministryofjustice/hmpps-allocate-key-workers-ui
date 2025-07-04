import { Request, Response } from 'express'

export class AssignRoleConfirmationController {
  GET = async (req: Request, res: Response) => {
    res.render('manage-roles/assign/confirmation/view', {
      showBreadcrumbs: true,
      staff: req.journeyData.assignStaffRole!.staff,
    })
  }
}
