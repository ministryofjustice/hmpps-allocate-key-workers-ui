import { JourneyRouter } from '../../../base/routes'
import { SelectServicesConfirmationController } from './controller'

export const SelectServicesConfirmationRoutes = () => {
  const { router, get } = JourneyRouter()
  const controller = new SelectServicesConfirmationController()

  get('/', controller.GET)

  return router
}
