import { Services } from '../../../../services'
import { JourneyRouter } from '../../../base/routes'
import { RemoveStaffRoleController } from './controller'
import { schema } from './schema'
import { validate } from '../../../../middleware/validationMiddleware'
import { RemoveRoleConfirmationRoutes } from './confirmation/routes'
import { ConfirmRemoveRoleRoutes } from './remove-role/routes'

export const RemoveStaffRoleRoutes = (services: Services) => {
  const { router, get, post } = JourneyRouter()
  const { keyworkerApiService } = services
  const controller = new RemoveStaffRoleController(keyworkerApiService)

  get('/', controller.GET)
  get('/select', controller.selectStaff)
  post('/', validate(schema), controller.POST)

  router.use('/remove-role', ConfirmRemoveRoleRoutes(services))
  router.use('/confirmation', RemoveRoleConfirmationRoutes())

  return router
}
