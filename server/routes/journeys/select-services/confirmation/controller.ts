import { Request, Response } from 'express'
import { restoreHistoryFromJourneyData } from '../../../../middleware/historyMiddleware'

export class SelectServicesConfirmationController {
  GET = async (req: Request, res: Response) => {
    restoreHistoryFromJourneyData(req, res)
    req.journeyData.journeyCompleted = true
    res.render('select-services/confirmation/view', {
      showBreadcrumbs: true,
      services: req.journeyData.selectServices!.services,
    })
  }
}
