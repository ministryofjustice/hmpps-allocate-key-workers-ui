import { Services } from '../../../../services'
import { JourneyRouter } from '../../../base/routes'
import { RemoveStaffRoleController } from './controller'
import { schema } from './schema'
import { validate } from '../../../../middleware/validationMiddleware'
import { RemoveRoleConfirmationRoutes } from './confirmation/routes'
import { ConfirmRemoveRoleRoutes } from './remove-role/routes'
import { Page } from '../../../../services/auditService'

export const RemoveStaffRoleRoutes = (services: Services) => {
  const { router, get, post } = JourneyRouter()
  const { keyworkerApiService } = services
  const controller = new RemoveStaffRoleController(keyworkerApiService)

  get('*any', Page.UPDATE_STAFF_JOB_CLASSIFICATION, (req, res, next) => {
    if (req.journeyData.removeStaffRole?.staff?.staffId) {
      res.setAuditDetails.staffId(req.journeyData.removeStaffRole.staff.staffId)
    }
    next()
  })

  get('/', controller.GET)
  get('/select', controller.selectStaff)
  post('/', validate(schema), controller.POST)

  router.use('/remove-role', ConfirmRemoveRoleRoutes(services))
  router.use('/confirmation', RemoveRoleConfirmationRoutes())

  return router
}
