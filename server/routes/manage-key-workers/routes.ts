import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { ManageKeyWorkersController } from './controller'

export const KeyWorkerMembersRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new ManageKeyWorkersController(keyworkerApiService)

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
