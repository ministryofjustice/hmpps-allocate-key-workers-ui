import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { RecommendStaffAutomaticallyController } from './controller'
import { validate } from '../../middleware/validationMiddleware'
import { selectKeyworkerSchema } from '../base/selectKeyworkerSchema'
import { requireAllocateRole } from '../../middleware/permissionsMiddleware'

export const RecommendStaffAutomaticallyRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new RecommendStaffAutomaticallyController(keyworkerApiService)

  get('/', controller.GET)
  post('/', requireAllocateRole, validate(selectKeyworkerSchema, true), controller.submitToApi, controller.POST)

  return router
}
