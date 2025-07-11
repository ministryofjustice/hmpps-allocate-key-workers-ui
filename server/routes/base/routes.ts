import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import { Page } from '../../services/auditService'
import { populateAuditPageName } from '../../middleware/audit/populateAuditPageName'

export const JourneyRouter = () => {
  const router = Router({ mergeParams: true })

  const get = <T, ResBody, ReqBody, Q>(
    path: string,
    pageOrHandler: RequestHandler<T, ResBody, ReqBody, Q> | Page,
    ...otherHandlers: RequestHandler<T, ResBody, ReqBody, Q>[]
  ) => {
    const firstHandler = typeof pageOrHandler === 'string' ? populateAuditPageName(pageOrHandler) : pageOrHandler
    const handlers = [firstHandler, ...otherHandlers]

    return router.get(path, ...handlers.slice(0, -1), asyncMiddleware(handlers.slice(-1)[0]!))
  }

  const post = <T, ResBody, ReqBody, Q>(path: string, ...handlers: RequestHandler<T, ResBody, ReqBody, Q>[]) =>
    router.post(path, ...handlers.slice(0, -1), asyncMiddleware(handlers.slice(-1)[0]!))

  return {
    router,
    get,
    post,
  }
}
