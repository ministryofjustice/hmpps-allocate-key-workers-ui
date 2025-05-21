import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

export const JourneyRouter = () => {
  const router = Router({ mergeParams: true })

  const get = <T, ResBody, ReqBody, Q>(path: string, ...handlers: RequestHandler<T, ResBody, ReqBody, Q>[]) =>
    router.get(path, ...handlers.slice(0, -1), asyncMiddleware(handlers.slice(-1)[0]!))
  const post = <T, ResBody, ReqBody, Q>(path: string, ...handlers: RequestHandler<T, ResBody, ReqBody, Q>[]) =>
    router.post(path, ...handlers.slice(0, -1), asyncMiddleware(handlers.slice(-1)[0]!))

  return {
    router,
    get,
    post,
  }
}
