import { validate, validateOnGET } from '../../middleware/validationMiddleware'
import { JourneyRouter } from '../base/routes'
import { selectKeyworkerSchema } from '../base/selectKeyworkerSchema'
import { requireRole } from '../../middleware/permissionsMiddleware'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'
import { Page } from '../../services/auditService'
import { schema } from './schema'
import { StaffProfileController } from './abstractController'

export const StaffProfileRoutes = <T extends StaffProfileController>(controller: T) => {
  const { router, get, post } = JourneyRouter()

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
