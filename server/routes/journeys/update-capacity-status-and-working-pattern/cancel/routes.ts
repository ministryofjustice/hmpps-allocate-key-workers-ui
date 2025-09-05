import { JourneyRouter } from '../../../base/routes'
import { CancelUpdateStatusController } from './controller'

export const CancelUpdateStatusRoutes = () => {
  const { router, get } = JourneyRouter()
  const controller = new CancelUpdateStatusController()

  get('/', controller.GET)

  return router
}
