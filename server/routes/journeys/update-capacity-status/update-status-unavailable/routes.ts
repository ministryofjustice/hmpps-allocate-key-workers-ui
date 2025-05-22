import { JourneyRouter } from '../../../base/routes'
import { UpdateStatusUnavailableController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from './schema'

export const UpdateStatusUnavailableRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateStatusUnavailableController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
