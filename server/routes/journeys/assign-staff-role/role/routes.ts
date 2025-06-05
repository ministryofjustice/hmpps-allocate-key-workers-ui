import { JourneyRouter } from '../../../base/routes'
import { SelectRoleController } from './controller'
import KeyworkerApiService from '../../../../services/keyworkerApi/keyworkerApiService'
import { validate } from '../../../../middleware/validationMiddleware'
import { schemaFactory } from './schema'

export const SelectRoleRoutes = (keyworkerApiService: KeyworkerApiService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new SelectRoleController(keyworkerApiService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(keyworkerApiService)), controller.POST)

  return router
}
