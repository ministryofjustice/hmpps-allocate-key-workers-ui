import { Request, Response } from 'express'

export class RemoveRoleConfirmationController {
  GET = async (req: Request, res: Response) => {
    res.render('manage-staff-roles/remove/confirmation/view', {
      showBreadcrumbs: true,
      staff: req.journeyData.removeStaffRole!.staff,
    })
  }
}
