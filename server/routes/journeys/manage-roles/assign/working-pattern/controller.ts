import { Request, Response } from 'express'
import { SchemaType } from './schema'

export class WorkingPatternController {
  GET = async (req: Request, res: Response) => {
    res.render('manage-roles/assign/working-pattern/view', {
      backUrl: 'role',
      scheduleType: req.journeyData.assignStaffRole!.scheduleType?.code,
    })
  }

  POST = (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.assignStaffRole!.scheduleType = req.body.scheduleType
    req.journeyData.assignStaffRole!.hoursPerWeek = req.body.scheduleType.hoursPerWeek
    res.redirect('capacity')
  }
}
