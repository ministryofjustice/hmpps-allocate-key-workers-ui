import { JourneyRouter } from '../base/routes'
import { ManageStaffRolesController } from './controller'
import { validate } from '../../middleware/validationMiddleware'
import { schemaFactory } from './schema'

export const ManageStaffRolesRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new ManageStaffRolesController()

  get('/', controller.GET)
  post('/', validate(schemaFactory), controller.POST)

  return router
}
