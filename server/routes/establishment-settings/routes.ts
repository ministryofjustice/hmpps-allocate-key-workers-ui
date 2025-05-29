import { NextFunction, Response, Request } from 'express'
import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { EstablishmentSettingsController } from './controller'
import { validate } from '../../middleware/validationMiddleware'
import { adminViewSchema, nonAdminViewSchema } from './schema'

export const EstablishmentSettingsRoutes = (services: Services) => {
  const adminRoutes = routes(services, true)
  const nonAdminRoutes = routes(services, false)

  return (req: Request, res: Response, next: NextFunction) =>
    (res.locals.user.permissions.admin ? adminRoutes : nonAdminRoutes)(req, res, next)
}

const routes = ({ keyworkerApiService }: Services, isAdmin: boolean) => {
  const { router, get, post } = JourneyRouter()
  const controller = new EstablishmentSettingsController(keyworkerApiService, isAdmin)

  get('/', controller.GET)
  post('/', validate(isAdmin ? adminViewSchema : nonAdminViewSchema), controller.submitToApi, controller.POST)

  return router
}
