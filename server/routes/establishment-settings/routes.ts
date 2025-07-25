import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { EstablishmentSettingsController } from './controller'
import { validate } from '../../middleware/validationMiddleware'
import { schemaFactory } from './schema'
import { Page } from '../../services/auditService'

export const EstablishmentSettingsRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new EstablishmentSettingsController(keyworkerApiService)

  get('/', Page.ESTABLISHMENT_SETTINGS, controller.GET)
  post('/', validate(schemaFactory), controller.submitToApi, controller.POST)

  return router
}
