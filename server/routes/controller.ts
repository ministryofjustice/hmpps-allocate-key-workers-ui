import { Request, Response } from 'express'
import Permissions from '../authentication/permissions'

export class HomePageController {
  GET = async (_req: Request, res: Response) => {
    res.locals.breadcrumbs.popLastItem()

    return res.render('view', {
      hasViewPermission: res.locals.user.permissions.includes(Permissions.View),
      hasAllocatePermission: res.locals.user.permissions.includes(Permissions.Allocate),
      showBreadcrumbs: true,
    })
  }
}
