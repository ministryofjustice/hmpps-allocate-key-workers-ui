import { Services } from '../../../../services'
import { JourneyRouter } from '../../../base/routes'
import { SelectServicesCheckAnswersController } from './controller'

export const SelectServicesCheckAnswersRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new SelectServicesCheckAnswersController(keyworkerApiService)

  get('/', controller.GET)
  post('/', controller.submitToApi, controller.POST)

  return router
}
