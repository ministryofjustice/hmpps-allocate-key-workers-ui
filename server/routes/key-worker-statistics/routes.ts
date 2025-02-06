import { validate } from '../../middleware/validationMiddleware'
import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { KeyWorkerStatisticsController } from './controller'
import { schema } from './schema'

export const KeyWorkerStatisticsRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new KeyWorkerStatisticsController(keyworkerApiService)

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
