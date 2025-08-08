import { Request, Response } from 'express'
import { SchemaType } from './schema'

export class AssignRoleCapacityController {
  GET = async (req: Request, res: Response) => {
    res.render('manage-roles/assign/capacity/view', {
      backUrl: 'back',
      capacity:
        res.locals.formResponses?.['capacity'] ??
        req.journeyData.assignStaffRole!.capacity ??
        req.middleware!.prisonConfiguration!.capacity,
    })
  }

  POST = (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.assignStaffRole!.capacity = req.body.capacity
    res.redirect('check-answers')
  }
}
