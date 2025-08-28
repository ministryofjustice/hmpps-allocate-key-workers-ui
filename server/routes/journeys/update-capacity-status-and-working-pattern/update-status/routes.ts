import { JourneyRouter } from '../../../base/routes'
import { UpdateStatusController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schemaFactory } from './schema'
import { Services } from '../../../../services'

export const UpdateStatusRoutes = ({ allocationsApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateStatusController(allocationsApiService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(allocationsApiService)), controller.POST)

  return router
}
