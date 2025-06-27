import { NextFunction, Request, Response } from 'express'
import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { RecommendStaffAutomaticallyController } from './controller'
import { validate } from '../../middleware/validationMiddleware'
import { selectKeyworkerSchema } from '../base/selectKeyworkerSchema'
import { requireAllocateRole } from '../../middleware/permissionsMiddleware'

export const RecommendStaffAutomaticallyRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new RecommendStaffAutomaticallyController(keyworkerApiService)

  const allowAutoAllocationGuard = (req: Request, res: Response, next: NextFunction) => {
    if (!req.middleware!.prisonConfiguration!.allowAutoAllocation) {
      return res.redirect(`/${res.locals.policyPath}`)
    }
    return next()
  }

  get('/', allowAutoAllocationGuard, controller.GET)
  post('/', requireAllocateRole, validate(selectKeyworkerSchema, true), controller.submitToApi, controller.POST)

  return router
}
