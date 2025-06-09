import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { RecommendKeyWorkersAutomaticallyController } from './controller'
import { validate } from '../../middleware/validationMiddleware'
import { selectKeyworkerSchema } from '../base/selectKeyworkerSchema'
import { requireAllocateRole } from '../../middleware/permissionsMiddleware'

export const RecommendKeyWorkersAutomaticallyRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new RecommendKeyWorkersAutomaticallyController(keyworkerApiService)

  get('/', controller.GET)
  post('/filter', controller.filter)
  post('/', requireAllocateRole, validate(selectKeyworkerSchema, true), controller.submitToApi, controller.POST)

  return router
}
