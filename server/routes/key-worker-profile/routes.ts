import { validate } from '../../middleware/validationMiddleware'
import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { KeyWorkerProfileController } from './controller'
import { selectKeyworkerSchema } from '../base/selectKeyworkerSchema'
import { requireAllocateRole } from '../../middleware/permissionsMiddleware'

export const KeyWorkerProfileRoutes = (services: Services) => {
  const { keyworkerApiService } = services
  const { router, get, post } = JourneyRouter()
  const controller = new KeyWorkerProfileController(keyworkerApiService)

  get('/', controller.GET)
  post('/', requireAllocateRole, validate(selectKeyworkerSchema), controller.submitToApi, controller.POST)

  return router
}
