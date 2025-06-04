import { Services } from '../../../services'
import { JourneyRouter } from '../../base/routes'
import { AssignStaffRoleController } from './controller'
import { schema } from './schema'
import { validate } from '../../../middleware/validationMiddleware'
import redirectCheckAnswersMiddleware from '../../../middleware/journey/redirectCheckAnswersMiddleware'

export const AssignStaffRoleRoutes = (services: Services) => {
  const { router, get, post } = JourneyRouter()
  const { keyworkerApiService } = services
  const controller = new AssignStaffRoleController(keyworkerApiService)

  router.use(redirectCheckAnswersMiddleware([/check-answers$/]))

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
