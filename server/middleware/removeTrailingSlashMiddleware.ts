import { Request, Response, NextFunction } from 'express'

export default function removeTrailingSlashMiddleware(req: Request, res: Response, next: NextFunction) {
  // remove trailing slash before query string, such as /add-any-alert/?alertType=D
  if (req.originalUrl.match(/\/\?/)) {
    return res.redirect(req.originalUrl.replace(/\/\?/g, '?'))
  }

  // remove trailing slash, except when the trailing slash is part of a query string instead of the path, such as /add-any-alert?description=some/
  if (req.originalUrl.slice(-1) === '/' && req.originalUrl.length > 1 && !/\?[^]*\//.test(req.originalUrl)) {
    return res.redirect(req.originalUrl.slice(0, -1))
  }

  return next()
}
