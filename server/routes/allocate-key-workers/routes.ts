import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { AllocateKeyWorkerController } from './controller'
import { validate } from '../../middleware/validationMiddleware'
import { selectKeyworkerSchema } from '../base/selectKeyworkerSchema'

export const AllocateKeyWorkerRoutes = ({ keyworkerApiService, locationsApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new AllocateKeyWorkerController(keyworkerApiService, locationsApiService)

  get('/', controller.GET)
  post('/filter', controller.filter)
  post('/', validate(selectKeyworkerSchema, true), controller.submitToApi, controller.POST)

  return router
}
