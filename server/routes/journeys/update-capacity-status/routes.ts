import { Services } from '../../../services'
import { JourneyRouter } from '../../base/routes'
import { UpdateCapacityAndStatusController } from './controller'
import { schemaFactory } from './schema'
import { validate } from '../../../middleware/validationMiddleware'
import { CancelUpdateStatusRoutes } from './cancel/routes'
import { UpdateStatusInactiveRoutes } from './update-status-inactive/routes'

export const UpdateCapacityAndStatusRoutes = (services: Services) => {
  const { router, get, post } = JourneyRouter()
  const { keyworkerApiService } = services
  const controller = new UpdateCapacityAndStatusController(keyworkerApiService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(keyworkerApiService)), controller.submitToApi, controller.POST)

  router.use('/update-status-inactive', UpdateStatusInactiveRoutes(services))
  router.use('/cancel', CancelUpdateStatusRoutes(services))

  return router
}
