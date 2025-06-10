import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { validate } from '../../middleware/validationMiddleware'
import { StaffDataController } from './controller'
import { schema } from './schema'

export const StaffDataRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new StaffDataController(keyworkerApiService)

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
