import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { ManageController } from './controller'
import { Page } from '../../services/auditService'

export const StaffMembersRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new ManageController(keyworkerApiService)

  get('/', Page.MANAGE_ALLOCATABLE_STAFF, controller.GET)
  post('/', controller.POST)

  return router
}
