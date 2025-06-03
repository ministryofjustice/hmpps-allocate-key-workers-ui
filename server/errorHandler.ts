import type { NextFunction, Request, Response } from 'express'
import type { HTTPError } from 'superagent'
import logger from '../logger'

export default function createErrorHandler(production: boolean) {
  return (error: HTTPError, req: Request, res: Response, _next: NextFunction): void => {
    logger.error(`Error handling request for '${req.originalUrl}', user '${res.locals.user?.username}'`, error)

    if (error.status === 404 || Object.hasOwn(error, 'deniedPermissionChecks')) {
      return res.notFound()
    }

    if (error.status === 401 || error.status === 403) {
      logger.info('Logging user out')
      return res.redirect('/sign-out')
    }

    if (production && ((error.status >= 500 && error.status < 600) || error.name?.includes('Error'))) {
      return res.render('pages/errorServiceProblem', {
        showBreadcrumbs: true,
      })
    }

    res.locals['message'] = production
      ? 'Something went wrong. The error has been logged. Please try again'
      : error.message
    res.locals['status'] = error.status
    res.locals['stack'] = production ? null : error.stack

    res.status(error.status || 500)

    return res.render('pages/error')
  }
}
