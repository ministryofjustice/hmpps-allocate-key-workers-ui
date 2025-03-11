import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { ProfileSummaryController } from './controller'

export const ProfileSummaryRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get } = JourneyRouter()
  const controller = new ProfileSummaryController(keyworkerApiService)

  get('/', controller.GET)

  return router
}
