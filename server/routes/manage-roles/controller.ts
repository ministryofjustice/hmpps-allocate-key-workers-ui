import { Request, Response } from 'express'
import { SchemaType } from './schema'

export class ManageRolesController {
  GET = async (_req: Request, res: Response) => {
    res.render('manage-roles/view', {
      showBreadcrumbs: true,
    })
  }

  POST = (req: Request<unknown, unknown, SchemaType>, res: Response) =>
    res.redirect(req.body.assignOrRemove === 'ASSIGN' ? 'manage-roles/assign' : 'manage-roles/remove')
}
