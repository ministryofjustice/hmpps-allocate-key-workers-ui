import { NotPrisonOfficerController } from './controller'
import { JourneyRouter } from '../../../../base/routes'

export const NotPrisonOfficerRoleRoutes = () => {
  const { router, get } = JourneyRouter()
  const controller = new NotPrisonOfficerController()

  get('/', controller.GET)

  return router
}
