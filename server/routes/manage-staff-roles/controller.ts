import { Request, Response } from 'express'
import { SchemaType } from './schema'

export class ManageStaffRolesController {
  GET = async (_req: Request, res: Response) => {
    res.render('manage-staff-roles/view', {
      showBreadcrumbs: true,
    })
  }

  POST = (req: Request<unknown, unknown, SchemaType>, res: Response) =>
    res.redirect(req.body.assignOrRemove === 'ASSIGN' ? 'manage-staff-roles/assign' : 'manage-staff-roles/remove')
}
