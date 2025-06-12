import { SelectPrisonOfficerRoleController } from './controller'
import { schema } from './schema'
import { JourneyRouter } from '../../../../base/routes'
import { validate } from '../../../../../middleware/validationMiddleware'

export const SelectPrisonOfficerRoleRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new SelectPrisonOfficerRoleController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
