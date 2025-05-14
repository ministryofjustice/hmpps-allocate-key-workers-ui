import { Services } from '../../../services'
import { JourneyRouter } from '../../base/routes'
import { UpdateCapacityAndStatusController } from './controller'
import { schemaFactory } from './schema'
import { validate } from '../../../middleware/validationMiddleware'

export const UpdateCapacityAndStatusRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateCapacityAndStatusController(keyworkerApiService)

  get('/', controller.GET)

  post('/', validate(schemaFactory(keyworkerApiService)), controller.POST)

  return router
}
