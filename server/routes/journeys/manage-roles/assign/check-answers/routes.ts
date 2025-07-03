import { Services } from '../../../../../services'
import { JourneyRouter } from '../../../../base/routes'
import { AssignRoleCheckAnswersController } from './controller'

export const AssignRoleCheckAnswersRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new AssignRoleCheckAnswersController(keyworkerApiService)

  get('/', controller.GET)
  post('/', controller.submitToApi, controller.POST)

  return router
}
