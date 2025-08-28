import { validate } from '../../middleware/validationMiddleware'
import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { StaffProfileController } from './controller'
import { selectKeyworkerSchema } from '../base/selectKeyworkerSchema'
import { requireRole } from '../../middleware/permissionsMiddleware'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'
import { Page } from '../../services/auditService'

export const StaffProfileRoutes = (services: Services) => {
  const { allocationsApiService } = services
  const { router, get, post } = JourneyRouter()
  const controller = new StaffProfileController(allocationsApiService)

  get('/', Page.STAFF_ALLOCATIONS, controller.GET)
  post(
    '/',
    requireRole(UserPermissionLevel.ALLOCATE),
    validate(selectKeyworkerSchema),
    controller.submitToApi(false),
    controller.POST,
  )

  return router
}
