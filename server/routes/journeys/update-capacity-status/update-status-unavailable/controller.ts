import { Request, Response } from 'express'
import { SchemaType } from './schema'

export class UpdateStatusUnavailableController {
  GET = async (req: Request, res: Response) => {
    const statusReasonPageTitle = req.journeyData.updateCapacityStatus!.status!.description.replace(/- (.+)$/, '($1)')
    res.render('journeys/update-capacity-status/update-status-unavailable/view', {
      ...req.journeyData.keyWorkerDetails!,
      newStatus: req.journeyData.updateCapacityStatus!.status,
      statusReasonPageTitle,
      deactivateActiveAllocations: req.journeyData.updateCapacityStatus!.deactivateActiveAllocations,
      removeFromAutoAllocation: req.journeyData.updateCapacityStatus!.removeFromAutoAllocation,
      backUrl: '../update-capacity-status',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.updateCapacityStatus!.deactivateActiveAllocations = req.body.deactivateActiveAllocations
    req.journeyData.updateCapacityStatus!.removeFromAutoAllocation = req.body.removeFromAutoAllocation
    if (req.journeyData.updateCapacityStatus!.status!.code === 'UNAVAILABLE_ANNUAL_LEAVE') {
      res.redirect('update-status-annual-leave-return')
    } else {
      res.redirect('check-answers')
    }
  }
}
