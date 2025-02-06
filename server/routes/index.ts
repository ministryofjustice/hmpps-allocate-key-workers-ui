import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import { HomePageController } from './controller'
import { KeyWorkerStatisticsRoutes } from './key-worker-statistics/routes'

export default function routes(services: Services): Router {
  const router = Router()
  const controller = new HomePageController()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', controller.GET)

  router.use('/key-worker-statistics', KeyWorkerStatisticsRoutes(services))

  return router
}
