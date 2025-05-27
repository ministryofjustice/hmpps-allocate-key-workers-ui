import { JourneyRouter } from '../../../base/routes'
import { UpdateStatusReturnDateController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from './schema'

export const UpdateStatusReturnDateRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateStatusReturnDateController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
