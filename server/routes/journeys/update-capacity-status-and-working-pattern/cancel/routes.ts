import { Services } from '../../../../services'
import { JourneyRouter } from '../../../base/routes'
import { CancelUpdateStatusController } from './controller'

export const CancelUpdateStatusRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get } = JourneyRouter()
  const controller = new CancelUpdateStatusController(keyworkerApiService)

  get('/', controller.GET)

  return router
}
