import { Services } from '../../../services'
import { JourneyRouter } from '../../base/routes'
import { StartUpdateStaffController } from './controller'

export const StartUpdateStaffRoutes = ({ allocationsApiService }: Services) => {
  const { router, get } = JourneyRouter()
  const controller = new StartUpdateStaffController(allocationsApiService)

  get('/', controller.GET)

  return router
}
