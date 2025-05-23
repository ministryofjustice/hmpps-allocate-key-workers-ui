import { Services } from '../../../../services'
import { JourneyRouter } from '../../../base/routes'
import { UpdateStatusCheckAnswersController } from './controller'

export const UpdateStatusCheckAnswersRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateStatusCheckAnswersController(keyworkerApiService)

  get('/', controller.GET)
  post('/', controller.submitToApi, controller.POST)

  return router
}
