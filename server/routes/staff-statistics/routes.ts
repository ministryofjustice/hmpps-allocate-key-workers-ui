import { validate } from '../../middleware/validationMiddleware'
import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { StaffStatisticsController } from './controller'
import { schema } from './schema'

export const StaffStatisticsRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new StaffStatisticsController(keyworkerApiService)

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
