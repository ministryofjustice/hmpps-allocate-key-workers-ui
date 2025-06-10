import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { ManageStaffController } from './controller'

export const StaffMembersRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new ManageStaffController(keyworkerApiService)

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
