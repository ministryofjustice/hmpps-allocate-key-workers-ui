import { NextFunction, Request, Response } from 'express'

export const populatePolicy = async (req: Request<{ policy: string }>, res: Response, next: NextFunction) => {
  switch (req.params.policy) {
    case 'key-worker':
      req.middleware ??= {}
      req.middleware.policy = 'KEY_WORKER'
      res.locals.policyName = 'key worker'
      return next()
    case 'personal-officer':
      req.middleware ??= {}
      req.middleware.policy = 'PERSONAL_OFFICER'
      res.locals.policyName = 'personal officer'
      return next()
    default:
      return res.notFound()
  }
}
