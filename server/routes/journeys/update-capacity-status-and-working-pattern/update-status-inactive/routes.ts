import { Services } from '../../../../services'
import { JourneyRouter } from '../../../base/routes'
import { UpdateStatusInactiveController } from './controller'

export const UpdateStatusInactiveRoutes = ({ allocationsApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateStatusInactiveController(allocationsApiService)

  get('/', controller.GET)
  post('/', controller.submitToApi, controller.POST)

  return router
}
