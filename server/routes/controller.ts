import { Request, Response } from 'express'

export class HomePageController {
  GET = async (req: Request, res: Response) => {
    res.locals.breadcrumbs.popLastItem()
    const { hasPrisonersWithHighComplexityNeeds } = req.middleware!.prisonConfiguration!

    return res.render('view', {
      showBreadcrumbs: true,
      hasPrisonersWithHighComplexityNeeds,
    })
  }
}
