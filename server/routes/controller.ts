import { Request, Response } from 'express'

export class HomePageController {
  GET = async (_req: Request, res: Response) => {
    res.locals.breadcrumbs.popLastItem()

    return res.render('view', {
      hasViewPermission: res.locals.user.permissions.includes('view'),
      hasAllocatePermission: res.locals.user.permissions.includes('allocate'),
      showBreadcrumbs: true,
    })
  }
}
