import { Router } from 'express'

export const journeyPaths: string[] = []

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
