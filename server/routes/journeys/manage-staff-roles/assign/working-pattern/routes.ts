import { WorkingPatternController } from './controller'
import { schema } from './schema'
import { JourneyRouter } from '../../../../base/routes'
import { validate } from '../../../../../middleware/validationMiddleware'

export const WorkingPatternRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new WorkingPatternController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
