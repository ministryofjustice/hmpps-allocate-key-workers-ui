import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { AllocateStaffController } from './controller'
import { validate } from '../../middleware/validationMiddleware'
import { selectKeyworkerSchema } from '../base/selectKeyworkerSchema'
import { requireAllocateRole } from '../../middleware/permissionsMiddleware'

export const AllocateStaffRoutes = ({ keyworkerApiService, locationsApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new AllocateStaffController(keyworkerApiService, locationsApiService)

  get('/', controller.GET)
  post('/filter', controller.filter)
  post('/', requireAllocateRole, validate(selectKeyworkerSchema, true), controller.submitToApi, controller.POST)

  return router
}
