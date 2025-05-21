import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { validate } from '../../middleware/validationMiddleware'
import { KeyWorkersDataController } from './controller'
import { schema } from './schema'

export const KeyWorkersDataRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new KeyWorkersDataController(keyworkerApiService)

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
