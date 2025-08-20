import { Request, Response } from 'express'
import { restoreHistoryFromJourneyData } from '../../../../../middleware/historyMiddleware'

export class AssignRoleConfirmationController {
  GET = async (req: Request, res: Response) => {
    restoreHistoryFromJourneyData(req, res)
    res.render('manage-roles/assign/confirmation/view', {
      showBreadcrumbs: true,
      staff: req.journeyData.assignStaffRole!.staff,
    })
  }
}
