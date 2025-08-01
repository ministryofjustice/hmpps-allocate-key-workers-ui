import { Request, Response } from 'express'
import { SchemaType } from './schema'

export class UpdateStatusUnavailableController {
  GET = async (req: Request, res: Response) => {
    const statusReasonPageTitle = req.journeyData.updateStaffDetails!.status!.description.replace(/- (.+)$/, '($1)')
    res.render('journeys/update-capacity-status-and-working-pattern/update-status-unavailable/view', {
      ...req.journeyData.staffDetails!,
      newStatus: req.journeyData.updateStaffDetails!.status,
      statusReasonPageTitle,
      deactivateActiveAllocations: req.journeyData.updateStaffDetails!.deactivateActiveAllocations,
      backUrl: 'back',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.updateStaffDetails!.deactivateActiveAllocations = req.body.deactivateActiveAllocations
    if (req.journeyData.updateStaffDetails!.status!.code === 'UNAVAILABLE_ANNUAL_LEAVE') {
      res.redirect('update-status-annual-leave-return')
    } else {
      res.redirect('check-answers')
    }
  }
}
