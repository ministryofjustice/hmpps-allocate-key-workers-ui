import { validate } from '../../middleware/validationMiddleware'
import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { StaffProfileController } from './controller'
import { selectKeyworkerSchema } from '../base/selectKeyworkerSchema'
import { requireRole } from '../../middleware/permissionsMiddleware'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'

export const StaffProfileRoutes = (services: Services) => {
  const { keyworkerApiService } = services
  const { router, get, post } = JourneyRouter()
  const controller = new StaffProfileController(keyworkerApiService)

  get('/', controller.GET)
  post(
    '/',
    requireRole(UserPermissionLevel.ALLOCATE),
    validate(selectKeyworkerSchema),
    controller.submitToApi,
    controller.POST,
  )

  return router
}
