import { Request, Response } from 'express'

export class SelectServicesConfirmationController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.journeyCompleted = true
    res.render('select-services/confirmation/view', {
      showBreadcrumbs: true,
      services: req.journeyData.selectServices!.services,
    })
  }
}
