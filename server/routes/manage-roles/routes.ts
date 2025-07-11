import { JourneyRouter } from '../base/routes'
import { ManageRolesController } from './controller'
import { validate } from '../../middleware/validationMiddleware'
import { schemaFactory } from './schema'
import { Page } from '../../services/auditService'

export const ManageRolesRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new ManageRolesController()

  get('/', Page.UPDATE_STAFF_JOB_CLASSIFICATION, controller.GET)
  post('/', validate(schemaFactory), controller.POST)

  return router
}
