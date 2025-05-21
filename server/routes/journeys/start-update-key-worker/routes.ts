import { Services } from '../../../services'
import { JourneyRouter } from '../../base/routes'
import { StartUpdateKeyWorkerController } from './controller'

export const StartUpdateKeyWorkerRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get } = JourneyRouter()
  const controller = new StartUpdateKeyWorkerController(keyworkerApiService)

  get('/', controller.GET)

  return router
}
