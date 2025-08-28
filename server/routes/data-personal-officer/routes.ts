import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { validateOnGET } from '../../middleware/validationMiddleware'
import { POStaffDataController } from './controller'
import { schema } from './schema'
import { Page } from '../../services/auditService'

export const POStaffDataRoutes = ({ allocationsApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new POStaffDataController(allocationsApiService)

  get(
    '/',
    Page.PRISON_STATISTICS,
    validateOnGET(schema, 'dateFrom', 'dateTo', 'compareDateFrom', 'compareDateTo'),
    controller.GET,
  )
  post('/', controller.POST)

  return router
}
