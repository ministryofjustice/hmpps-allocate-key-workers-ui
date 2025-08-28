import { Services } from '../../../../services'
import { JourneyRouter } from '../../../base/routes'
import { SelectServicesCheckAnswersController } from './controller'

export const SelectServicesCheckAnswersRoutes = ({ allocationsApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new SelectServicesCheckAnswersController(allocationsApiService)

  get('/', controller.GET)
  post('/', controller.submitToApi, controller.POST)

  return router
}
