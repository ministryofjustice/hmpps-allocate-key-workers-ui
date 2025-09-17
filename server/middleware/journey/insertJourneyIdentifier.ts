import { NextFunction, Request, Response, Router } from 'express'
import { v4 as uuidV4, validate } from 'uuid'

const journeyPaths: string[] = []

export const captureJourneyPaths = (router: Router) => {
  const routerUse = router.use
  // eslint-disable-next-line no-param-reassign
  router.use = (...params: unknown[]) => {
    if (typeof params[0] === 'string') {
      journeyPaths.push(params[0].split('/')[1] ?? params[0])
    }
    // @ts-expect-error unspecified router.use param types
    return routerUse.call(router, ...params)
  }
}

export default function insertJourneyIdentifier() {
  const router = Router({ mergeParams: true })

  if (process.env.NODE_ENV !== 'production') {
    if (journeyPaths.length === 0) {
      throw new Error('No journey paths registered. Please add captureJourneyPaths(router) before the journey paths.')
    }
  }

  router.use(new RegExp(`/(${journeyPaths.join('|')})`), (req: Request, res: Response, next: NextFunction): void => {
    const uuid = req.url.split('/')[1]
    if (!validate(uuid)) {
      const basePaths = req.baseUrl.split('/')
      return res.redirect(`${[...basePaths.slice(0, -1), uuidV4(), ...basePaths.slice(-1)].join('/')}${req.url}`)
    }
    return next()
  })

  return router
}
