import { Request, Response } from 'express'

export class RemoveRoleConfirmationController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.journeyCompleted = true
    res.render('manage-roles/remove/confirmation/view', {
      showBreadcrumbs: true,
      staff: req.journeyData.removeStaffRole!.staff,
    })
  }
}
