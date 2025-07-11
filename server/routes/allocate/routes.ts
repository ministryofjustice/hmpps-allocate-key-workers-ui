import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { AllocateStaffController } from './controller'
import { validate } from '../../middleware/validationMiddleware'
import { selectKeyworkerSchema } from '../base/selectKeyworkerSchema'
import { requireRole } from '../../middleware/permissionsMiddleware'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'
import { Page } from '../../services/auditService'

export const AllocateStaffRoutes = ({ keyworkerApiService, locationsApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new AllocateStaffController(keyworkerApiService, locationsApiService)

  get('/', Page.ALLOCATE, controller.GET)
  post('/filter', controller.filter)
  post(
    '/',
    requireRole(UserPermissionLevel.ALLOCATE),
    validate(selectKeyworkerSchema, true),
    controller.submitToApi(false),
    controller.POST,
  )

  return router
}
