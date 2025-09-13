import { Request, Response } from 'express'
import { SchemaType } from './schema'

export class SelectPrisonOfficerRoleController {
  GET = async (req: Request, res: Response) => {
    res.render('manage-roles/assign/role/view', {
      backUrl: `../assign`,
      isPrisonOfficer: req.journeyData.assignStaffRole!.isPrisonOfficer,
    })
  }

  POST = (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.assignStaffRole!.isPrisonOfficer = req.body.isPrisonOfficer === 'YES'
    res.redirect(req.journeyData.assignStaffRole!.isPrisonOfficer ? 'working-pattern' : 'not-prison-officer')
  }
}
