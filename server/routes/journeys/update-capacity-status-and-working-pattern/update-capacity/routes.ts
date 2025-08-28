import { JourneyRouter } from '../../../base/routes'
import { UpdateCapacityController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from './schema'
import { Services } from '../../../../services'

export const UpdateCapacityPatternRoutes = ({ allocationsApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateCapacityController(allocationsApiService)

  get('/', controller.GET)
  post('/', validate(schema), controller.submitToApi, controller.POST)

  return router
}
