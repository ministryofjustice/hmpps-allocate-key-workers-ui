import { AssignRoleCapacityController } from './controller'
import { schema } from './schema'
import { JourneyRouter } from '../../../../base/routes'
import { validate } from '../../../../../middleware/validationMiddleware'

export const AssignRoleCapacityRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new AssignRoleCapacityController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
