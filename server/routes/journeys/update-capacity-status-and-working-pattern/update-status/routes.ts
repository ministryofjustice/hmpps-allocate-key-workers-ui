import { JourneyRouter } from '../../../base/routes'
import { UpdateStatusController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schemaFactory } from './schema'
import { Services } from '../../../../services'

export const UpdateStatusRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateStatusController(keyworkerApiService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(keyworkerApiService)), controller.POST)

  return router
}
