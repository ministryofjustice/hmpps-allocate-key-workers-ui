import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { validateOnGET } from '../../middleware/validationMiddleware'
import { StaffDataController } from './controller'
import { schema } from './schema'
import { Page } from '../../services/auditService'

export const StaffDataRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new StaffDataController(keyworkerApiService)

  get('/', Page.PRISON_STATISTICS, validateOnGET(schema, 'dateFrom', 'dateTo'), controller.GET)
  post('/', controller.POST)

  return router
}
