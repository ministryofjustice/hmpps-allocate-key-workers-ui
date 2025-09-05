import { Services } from '../../../services'
import { JourneyRouter } from '../../base/routes'
import { UpdateCapacityAndStatusController } from './controller'
import { CancelUpdateStatusRoutes } from './cancel/routes'
import { UpdateStatusInactiveRoutes } from './update-status-inactive/routes'
import redirectCheckAnswersMiddleware from '../../../middleware/journey/redirectCheckAnswersMiddleware'
import { UpdateStatusUnavailableRoutes } from './update-status-unavailable/routes'
import { UpdateStatusCheckAnswersRoutes } from './check-answers/routes'
import { UpdateStatusReturnDateRoutes } from './update-status-annual-leave-return/routes'
import { UpdateWorkingPatternRoutes } from './update-working-pattern/routes'
import { UpdateCapacityPatternRoutes } from './update-capacity/routes'
import { UpdateStatusRoutes } from './update-status/routes'
import { Page } from '../../../services/auditService'

export const UpdateCapacityAndStatusRoutes = (services: Services) => {
  const { router, get } = JourneyRouter()
  const controller = new UpdateCapacityAndStatusController()

  router.use(redirectCheckAnswersMiddleware([/update-capacity-status-and-working-pattern$/, /check-answers$/]))

  get('*any', Page.UPDATE_STAFF_CONFIGURATION, (req, res, next) => {
    if (req.journeyData.staffDetails?.staffId) {
      res.setAuditDetails.staffId(req.journeyData.staffDetails.staffId)
    }
    next()
  })

  get('/', controller.GET)

  router.use('/update-working-pattern', UpdateWorkingPatternRoutes(services))
  router.use('/update-capacity', UpdateCapacityPatternRoutes(services))
  router.use('/update-status', UpdateStatusRoutes(services))
  router.use('/update-status-unavailable', UpdateStatusUnavailableRoutes())
  router.use('/update-status-inactive', UpdateStatusInactiveRoutes(services))
  router.use('/update-status-annual-leave-return', UpdateStatusReturnDateRoutes())
  router.use('/cancel', CancelUpdateStatusRoutes())
  router.use('/check-answers', UpdateStatusCheckAnswersRoutes(services))

  return router
}
