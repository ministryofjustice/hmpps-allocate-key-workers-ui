import { Request, Response } from 'express'
import { restoreHistoryFromJourneyData } from '../../../../../middleware/historyMiddleware'

export class RemoveRoleConfirmationController {
  GET = async (req: Request, res: Response) => {
    restoreHistoryFromJourneyData(req, res)
    req.journeyData.journeyCompleted = true
    res.render('manage-roles/remove/confirmation/view', {
      showBreadcrumbs: true,
      staff: req.journeyData.removeStaffRole!.staff,
    })
  }
}
