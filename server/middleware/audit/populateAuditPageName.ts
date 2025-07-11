import { RequestHandler } from 'express'
import { Page } from '../../services/auditService'

export const populateAuditPageName =
  <T, ResBody, ReqBody, Q>(page: Page): RequestHandler<T, ResBody, ReqBody, Q> =>
  async (_req, res, next) => {
    if (res.locals.auditEvent.details) res.locals.auditEvent.details.pageName = page
    next()
  }
