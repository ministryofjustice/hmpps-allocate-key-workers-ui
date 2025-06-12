import { Request, Response } from 'express'
import { SchemaType } from './schema'

export class WorkingPatternController {
  GET = async (req: Request, res: Response) => {
    res.render('manage-staff-roles/assign/working-pattern/view', {
      backUrl: '../assign',
      workingHour: req.journeyData.assignStaffRole!.workingHour,
    })
  }

  POST = (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.assignStaffRole!.workingHour = req.body.workingPattern
    res.redirect('check-answers')
  }
}
