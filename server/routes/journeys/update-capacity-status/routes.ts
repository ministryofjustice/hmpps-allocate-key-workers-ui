import { Services } from '../../../services'
import { JourneyRouter } from '../../base/routes'
import { UpdateCapacityAndStatusController } from './controller'
import { schemaFactory } from './schema'
import { validate } from '../../../middleware/validationMiddleware'
import { CancelUpdateStatusRoutes } from './cancel/routes'
import { UpdateStatusInactiveRoutes } from './update-status-inactive/routes'
import redirectCheckAnswersMiddleware from '../../../middleware/journey/redirectCheckAnswersMiddleware'
import { UpdateStatusUnavailableRoutes } from './update-status-unavailable/routes'
import { UpdateStatusCheckAnswersRoutes } from './check-answers/routes'
import { UpdateStatusReturnDateRoutes } from './update-status-annual-leave-return/routes'

export const UpdateCapacityAndStatusRoutes = (services: Services) => {
  const { router, get, post } = JourneyRouter()
  const { keyworkerApiService } = services
  const controller = new UpdateCapacityAndStatusController(keyworkerApiService)

  router.use(redirectCheckAnswersMiddleware([/update-capacity-status$/, /check-answers$/]))

  get('/', controller.GET)
  post('/', validate(schemaFactory(keyworkerApiService)), controller.submitToApi, controller.POST)

  router.use('/update-status-unavailable', UpdateStatusUnavailableRoutes())
  router.use('/update-status-inactive', UpdateStatusInactiveRoutes(services))
  router.use('/update-status-annual-leave-return', UpdateStatusReturnDateRoutes())
  router.use('/cancel', CancelUpdateStatusRoutes(services))
  router.use('/check-answers', UpdateStatusCheckAnswersRoutes(services))

  return router
}
