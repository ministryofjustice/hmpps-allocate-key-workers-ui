import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { EstablishmentSettingsController } from './controller'
import { validate } from '../../middleware/validationMiddleware'
import { schemaFactory } from './schema'

export const EstablishmentSettingsRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new EstablishmentSettingsController(keyworkerApiService)

  get('/', controller.GET)
  post('/', validate(schemaFactory), controller.submitToApi, controller.POST)

  return router
}
