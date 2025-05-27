import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { AllocateKeyWorkerController } from './controller'
import { validate } from '../../middleware/validationMiddleware'
import { schema } from '../key-worker-profile/schema'

export const AllocateKeyWorkerRoutes = ({ keyworkerApiService, locationsApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new AllocateKeyWorkerController(keyworkerApiService, locationsApiService)

  get('/', controller.GET)
  post('/filter', controller.filter)
  post('/', validate(schema), controller.submitToApi, controller.POST)

  return router
}
