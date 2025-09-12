import { Services } from '../../../../services'
import { JourneyRouter } from '../../../base/routes'
import { AssignStaffRoleController } from './controller'
import { schema } from './schema'
import { validate } from '../../../../middleware/validationMiddleware'
import redirectCheckAnswersMiddleware from '../../../../middleware/journey/redirectCheckAnswersMiddleware'
import { SelectPrisonOfficerRoleRoutes } from './role/routes'
import { NotPrisonOfficerRoleRoutes } from './not-prison-officer/routes'
import { WorkingPatternRoutes } from './working-pattern/routes'
import { AssignRoleCheckAnswersRoutes } from './check-answers/routes'
import { AssignRoleConfirmationRoutes } from './confirmation/routes'
import { AssignRoleCapacityRoutes } from './capacity/routes'
import { Page } from '../../../../services/auditService'

export const AssignStaffRoleRoutes = (services: Services) => {
  const { router, get, post } = JourneyRouter()
  const { allocationsApiService } = services
  const controller = new AssignStaffRoleController(allocationsApiService)

  router.use(redirectCheckAnswersMiddleware([/assign$/, /not-prison-officer$/, /check-answers/]))

  get('*any', Page.UPDATE_STAFF_JOB_CLASSIFICATION, (req, res, next) => {
    if (req.journeyData.assignStaffRole?.staff?.staffId) {
      res.setAuditDetails.staffId(req.journeyData.assignStaffRole.staff.staffId)
    }
    next()
  })

  get('/', controller.GET)
  get('/select', controller.selectStaff)
  post('/', validate(schema), controller.POST)

  router.use('/role', SelectPrisonOfficerRoleRoutes())
  router.use('/not-prison-officer', NotPrisonOfficerRoleRoutes())
  router.use('/working-pattern', WorkingPatternRoutes())
  router.use('/capacity', AssignRoleCapacityRoutes())
  router.use('/check-answers', AssignRoleCheckAnswersRoutes(services))
  router.use('/confirmation', AssignRoleConfirmationRoutes())

  return router
}
