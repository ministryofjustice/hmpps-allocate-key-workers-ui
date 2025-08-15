import { validate, validateOnGET } from '../../middleware/validationMiddleware'
import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { POStaffProfileController } from './controller'
import { selectKeyworkerSchema } from '../base/selectKeyworkerSchema'
import { requireRole } from '../../middleware/permissionsMiddleware'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'
import { Page } from '../../services/auditService'
import { schema } from './schema'

export const POStaffProfileRoutes = (services: Services) => {
  const { keyworkerApiService } = services
  const { router, get, post } = JourneyRouter()
  const controller = new POStaffProfileController(keyworkerApiService)

  get(
    '/',
    Page.STAFF_ALLOCATIONS,
    validateOnGET(schema, 'dateFrom', 'dateTo', 'compareDateFrom', 'compareDateTo'),
    controller.GET,
  )
  post('/filter', controller.filter)
  post(
    '/',
    requireRole(UserPermissionLevel.ALLOCATE),
    validate(selectKeyworkerSchema),
    controller.submitToApi(false),
    controller.POST,
  )

  return router
}
