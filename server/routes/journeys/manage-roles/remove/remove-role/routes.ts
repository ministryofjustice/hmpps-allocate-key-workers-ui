import { Services } from '../../../../../services'
import { JourneyRouter } from '../../../../base/routes'
import { ConfirmRemoveRoleController } from './controller'

export const ConfirmRemoveRoleRoutes = ({ allocationsApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new ConfirmRemoveRoleController(allocationsApiService)

  get('/', controller.GET)
  post('/', controller.submitToApi, controller.POST)

  return router
}
