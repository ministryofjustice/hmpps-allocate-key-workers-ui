import { Services } from '../../../../../services'
import { JourneyRouter } from '../../../../base/routes'
import { AssignRoleCheckAnswersController } from './controller'

export const AssignRoleCheckAnswersRoutes = ({ allocationsApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new AssignRoleCheckAnswersController(allocationsApiService)

  get('/', controller.GET)
  post('/', controller.submitToApi, controller.POST)

  return router
}
