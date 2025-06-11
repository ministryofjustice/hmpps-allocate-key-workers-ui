import { Services } from '../../../services'
import { JourneyRouter } from '../../base/routes'
import { StartUpdateStaffController } from './controller'

export const StartUpdateStaffRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get } = JourneyRouter()
  const controller = new StartUpdateStaffController(keyworkerApiService)

  get('/', controller.GET)

  return router
}
