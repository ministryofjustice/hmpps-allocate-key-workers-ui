import { Request, Response, NextFunction } from 'express'

export default function removeTrailingSlashMiddleware(req: Request, res: Response, next: NextFunction) {
  // remove trailing slash before query string, such as /add-any-alert/?alertType=D
  if (req.middleware!.safeOriginalUrl!.match(/\/\?/)) {
    return res.redirect(req.middleware!.safeOriginalUrl!.replace(/\/\?/g, '?'))
  }

  // remove trailing slash, except when the trailing slash is part of a query string instead of the path, such as /add-any-alert?description=some/
  if (
    req.middleware!.safeOriginalUrl!.slice(-1) === '/' &&
    req.middleware!.safeOriginalUrl!.length > 1 &&
    !/\?[^]*\//.test(req.middleware!.safeOriginalUrl!)
  ) {
    return res.redirect(req.middleware!.safeOriginalUrl!.slice(0, -1))
  }

  return next()
}
