import { NextFunction, Request, RequestHandler, Response } from 'express'
import { services } from '../services'
import logger from '../../logger'
import AuthorisedRoles from '../authentication/authorisedRoles'

function hasRole(res: Response, ...roles: AuthorisedRoles[]): boolean {
  return roles.some(role => res.locals.user.userRoles.includes(role))
}

export const requireAllocateRole = (req: Request, res: Response, next: NextFunction) => {
  if (res.locals.user.permissions.allocate) {
    return next()
  }

  return res.redirect(req.headers['referer'] || '/')
}

export function populateUserPermissions(): RequestHandler {
  const { keyworkerApiService } = services()

  return async (req, res, next) => {
    try {
      const prisonCode = res.locals.user.getActiveCaseloadId()!

      const userViewPermission =
        res.locals.user.userRoles.includes(AuthorisedRoles.KEYWORKER_MONITOR) ||
        (await keyworkerApiService.isKeyworker(req, prisonCode, res.locals.user.username))

      res.locals.user.permissions = {
        view: userViewPermission || hasRole(res, AuthorisedRoles.OMIC_ADMIN, AuthorisedRoles.KW_MIGRATION),
        allocate: hasRole(res, AuthorisedRoles.OMIC_ADMIN, AuthorisedRoles.KW_MIGRATION),
        admin: hasRole(res, AuthorisedRoles.KW_MIGRATION),
      }

      res.locals.prisonConfiguration = await keyworkerApiService.getPrisonConfig(req, prisonCode)

      if (!res.locals.prisonConfiguration.isEnabled) {
        return res.render('pages/service-not-enabled')
      }

      if (!res.locals.user.permissions.view && !res.locals.user.permissions.allocate) {
        return res.redirect('/not-authorised')
      }

      return next()
    } catch (e) {
      logger.error(e, `Failed to retrieve keyworker status: ${res.locals.user?.username}`)
      return res.render('pages/errorServiceProblem', {
        showBreadcrumbs: true,
      })
    }
  }
}
