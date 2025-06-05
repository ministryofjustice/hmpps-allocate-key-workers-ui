import { Services } from '../../../services'
import { JourneyRouter } from '../../base/routes'
import { AssignStaffRoleController } from './controller'
import { schema } from './schema'
import { validate } from '../../../middleware/validationMiddleware'
import redirectCheckAnswersMiddleware from '../../../middleware/journey/redirectCheckAnswersMiddleware'
import { SelectRoleRoutes } from './role/routes'
import { SelectOtherRoleRoutes } from './other-role/routes'

export const AssignStaffRoleRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new AssignStaffRoleController(keyworkerApiService)

  router.use(redirectCheckAnswersMiddleware([/role$/, /check-answers$/]))

  get('/', controller.GET)
  get('/select', controller.selectStaff)
  post('/', validate(schema), controller.POST)

  router.use('/role', SelectRoleRoutes(keyworkerApiService))
  router.use('/other-role', SelectOtherRoleRoutes(keyworkerApiService))

  return router
}
