import { Request, Response } from 'express'

export class NotPrisonOfficerController {
  GET = async (_req: Request, res: Response) => {
    res.render('manage-staff-roles/assign/not-prison-officer/view', {
      backUrl: 'role',
    })
  }
}
