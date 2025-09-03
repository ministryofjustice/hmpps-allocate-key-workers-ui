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
  const { allocationsApiService } = services
  const { router, get, post } = JourneyRouter()
  const controller = new POStaffProfileController(allocationsApiService)

  get(
    '/',
    Page.STAFF_ALLOCATIONS,
    validateOnGET(schema, 'dateFrom', 'dateTo', 'compareDateFrom', 'compareDateTo'),
    controller.GET,
  )
  get(
    '/case-notes',
    Page.STAFF_CASE_NOTES,
    validateOnGET(schema, 'dateFrom', 'dateTo', 'compareDateFrom', 'compareDateTo'),
    controller.GET_CASE_NOTES,
  )
  post(
    '/',
    requireRole(UserPermissionLevel.ALLOCATE),
    validate(selectKeyworkerSchema),
    controller.submitToApi(false),
    controller.POST,
  )

  return router
}
