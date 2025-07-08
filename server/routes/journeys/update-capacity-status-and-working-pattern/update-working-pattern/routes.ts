import { JourneyRouter } from '../../../base/routes'
import { UpdateWorkingPatternController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from '../../manage-roles/assign/working-pattern/schema'
import { Services } from '../../../../services'

export const UpdateWorkingPatternRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateWorkingPatternController(keyworkerApiService)

  get('/', controller.GET)
  post('/', validate(schema), controller.submitToApi, controller.POST)

  return router
}
