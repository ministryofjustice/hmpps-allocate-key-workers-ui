import { Router } from 'express'

export const checkJourneyIdSetup = (router: Router, supportedJourneyPaths: string[]) => {
  if (process.env.NODE_ENV !== 'production') {
    const routerUse = router.use
    // eslint-disable-next-line no-param-reassign
    router.use = (...params: unknown[]) => {
      if (typeof params[0] === 'string') {
        const path = params[0].split('/')[1] ?? params[0]
        if (!supportedJourneyPaths.includes(path)) {
          throw new Error(`Path: ${path} is not covered by insertJourneyIdentifier middleware.`)
        }
      }
      // @ts-expect-error unspecified router.use param types
      return routerUse.call(router, ...params)
    }
  }
}
