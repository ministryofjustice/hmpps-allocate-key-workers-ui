import { Services } from '../../../../services'
import { JourneyRouter } from '../../../base/routes'
import { CancelUpdateStatusController } from './controller'

export const CancelUpdateStatusRoutes = ({ allocationsApiService }: Services) => {
  const { router, get } = JourneyRouter()
  const controller = new CancelUpdateStatusController(allocationsApiService)

  get('/', controller.GET)

  return router
}
