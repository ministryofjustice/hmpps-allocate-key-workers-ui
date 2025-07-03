import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { ManageController } from './controller'

export const StaffMembersRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new ManageController(keyworkerApiService)

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
