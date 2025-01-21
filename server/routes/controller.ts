import { Request, Response } from 'express'

export class HomePageController {
  GET = async (_req: Request, res: Response) => {
    res.locals.breadcrumbs.popLastItem()

    return res.render('view', {
      showBreadcrumbs: true,
    })
  }
}
