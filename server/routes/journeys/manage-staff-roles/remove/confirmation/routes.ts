import { JourneyRouter } from '../../../../base/routes'
import { RemoveRoleConfirmationController } from './controller'

export const RemoveRoleConfirmationRoutes = () => {
  const { router, get } = JourneyRouter()
  const controller = new RemoveRoleConfirmationController()

  get('/', controller.GET)

  return router
}
