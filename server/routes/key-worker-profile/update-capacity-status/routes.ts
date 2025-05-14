import { Services } from '../../../services'
import { JourneyRouter } from '../../base/routes'
import { UpdateCapacityAndStatusController } from './controller'
import { schema } from './schema'
import { validate } from '../../../middleware/validationMiddleware'

export const UpdateCapacityAndStatusRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateCapacityAndStatusController(keyworkerApiService)

  get('/', controller.GET)

  post('/', validate(schema), controller.POST)

  return router
}
