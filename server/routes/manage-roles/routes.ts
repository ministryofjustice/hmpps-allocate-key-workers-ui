import { JourneyRouter } from '../base/routes'
import { ManageRolesController } from './controller'
import { validate } from '../../middleware/validationMiddleware'
import { schemaFactory } from './schema'

export const ManageRolesRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new ManageRolesController()

  get('/', controller.GET)
  post('/', validate(schemaFactory), controller.POST)

  return router
}
