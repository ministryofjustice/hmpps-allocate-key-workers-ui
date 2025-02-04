import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

export const JourneyRouter = () => {
  const router = Router({ mergeParams: true })

  const get = (path: string, ...handlers: RequestHandler[]) =>
    router.get(path, ...handlers.slice(0, -1), asyncMiddleware(handlers.slice(-1)[0]!))
  const post = (path: string, ...handlers: RequestHandler[]) =>
    router.post(path, ...handlers.slice(0, -1), asyncMiddleware(handlers.slice(-1)[0]!))

  return {
    router,
    get,
    post,
  }
}
