import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { validateOnGET } from '../../middleware/validationMiddleware'
import { KWStaffDataController } from './controller'
import { schema } from '../data-personal-officer/schema'
import { Page } from '../../services/auditService'

export const KWStaffDataRoutes = ({ allocationsApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new KWStaffDataController(allocationsApiService)

  get(
    '/',
    Page.PRISON_STATISTICS,
    validateOnGET(schema, 'dateFrom', 'dateTo', 'compareDateFrom', 'compareDateTo'),
    controller.GET,
  )
  post('/', controller.POST)

  return router
}
