import { NextFunction, Request, Response } from 'express'
import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { RecommendStaffAutomaticallyController } from './controller'
import { validate } from '../../middleware/validationMiddleware'
import { selectKeyworkerSchema } from '../base/selectKeyworkerSchema'
import { requireRole } from '../../middleware/permissionsMiddleware'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'
import { Page } from '../../services/auditService'

export const RecommendStaffAutomaticallyRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new RecommendStaffAutomaticallyController(keyworkerApiService)

  const allowAutoAllocationGuard = (req: Request, res: Response, next: NextFunction) => {
    if (!req.middleware!.prisonConfiguration!.allowAutoAllocation) {
      return res.redirect(`/${res.locals.policyPath}`)
    }
    return next()
  }

  get('/', Page.RECOMMENDED_ALLOCATIONS, allowAutoAllocationGuard, controller.GET)
  post(
    '/',
    requireRole(UserPermissionLevel.ALLOCATE),
    validate(selectKeyworkerSchema, true),
    controller.submitToApi(true),
    controller.POST,
  )

  return router
}
