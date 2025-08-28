import { Services } from '../../../services'
import { JourneyRouter } from '../../base/routes'
import { SelectServicesController } from './controller'
import { Page } from '../../../services/auditService'
import { validate } from '../../../middleware/validationMiddleware'
import { schema } from './schema'
import { SelectServicesCheckAnswersRoutes } from './check-answers/routes'
import { SelectServicesConfirmationRoutes } from './confirmation/routes'

export const SelectServicesRoutes = (services: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new SelectServicesController(services.allocationsApiService)

  get('*any', Page.SELECT_SERVICES, (req, res, next) => {
    if (req.journeyData.staffDetails?.staffId) {
      res.setAuditDetails.staffId(req.journeyData.staffDetails.staffId)
    }
    next()
  })

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  router.use('/check-answers', SelectServicesCheckAnswersRoutes(services))
  router.use('/confirmation', SelectServicesConfirmationRoutes())

  return router
}
