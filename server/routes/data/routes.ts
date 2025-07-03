import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { validateOnGET } from '../../middleware/validationMiddleware'
import { DataController } from './controller'
import { schema } from './schema'

export const DataRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new DataController(keyworkerApiService)

  get('/', validateOnGET(schema, 'dateFrom', 'dateTo'), controller.GET)
  post('/', controller.POST)

  return router
}
