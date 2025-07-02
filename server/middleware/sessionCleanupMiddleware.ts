import { NextFunction, Response, Request } from 'express'

export const sessionCleanupMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.path.endsWith('staff-data')) {
    delete req.session.reportingPeriod
  }
  next()
}
