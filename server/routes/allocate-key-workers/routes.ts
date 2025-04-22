import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { AllocateKeyWorkerController } from './controller'

export const AllocateKeyWorkerRoutes = ({ keyworkerApiService, locationsApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new AllocateKeyWorkerController(keyworkerApiService, locationsApiService)

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
