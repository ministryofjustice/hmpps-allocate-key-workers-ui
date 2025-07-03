import { Services } from '../../../../../services'
import { JourneyRouter } from '../../../../base/routes'
import { ConfirmRemoveRoleController } from './controller'

export const ConfirmRemoveRoleRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new ConfirmRemoveRoleController(keyworkerApiService)

  get('/', controller.GET)
  post('/', controller.submitToApi, controller.POST)

  return router
}
