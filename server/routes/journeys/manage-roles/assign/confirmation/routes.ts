import { JourneyRouter } from '../../../../base/routes'
import { AssignRoleConfirmationController } from './controller'

export const AssignRoleConfirmationRoutes = () => {
  const { router, get } = JourneyRouter()
  const controller = new AssignRoleConfirmationController()

  get('/', controller.GET)

  return router
}
