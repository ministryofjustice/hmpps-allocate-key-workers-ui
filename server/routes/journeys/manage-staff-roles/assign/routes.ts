import { Services } from '../../../../services'
import { JourneyRouter } from '../../../base/routes'
import { AssignStaffRoleController } from './controller'
import { schema } from './schema'
import { validate } from '../../../../middleware/validationMiddleware'
import redirectCheckAnswersMiddleware from '../../../../middleware/journey/redirectCheckAnswersMiddleware'
import { SelectPrisonOfficerRoleRoutes } from './role/routes'
import { NotPrisonOfficerRoleRoutes } from './not-prison-officer/routes'

export const AssignStaffRoleRoutes = (services: Services) => {
  const { router, get, post } = JourneyRouter()
  const { keyworkerApiService } = services
  const controller = new AssignStaffRoleController(keyworkerApiService)

  router.use(redirectCheckAnswersMiddleware([/not-prison-officer$/, /check-answers$/]))

  get('/', controller.GET)
  get('/select', controller.selectStaff)
  post('/', validate(schema), controller.POST)

  router.use('/role', SelectPrisonOfficerRoleRoutes())
  router.use('/not-prison-officer', NotPrisonOfficerRoleRoutes())

  return router
}
