import { Services } from '../../../../services'
import { JourneyRouter } from '../../../base/routes'
import { UpdateStatusInactiveController } from './controller'

export const UpdateStatusInactiveRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateStatusInactiveController(keyworkerApiService)

  get('/', controller.GET)
  post('/', controller.SubmitToApi, controller.POST)

  return router
}
