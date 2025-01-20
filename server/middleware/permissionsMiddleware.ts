import { RequestHandler } from 'express'
import { services } from '../services'
import logger from '../../logger'
import AuthorisedRoles from '../authentication/authorisedRoles'
import Permissions from '../authentication/permissions'

export default function populateUserPermissions(): RequestHandler {
  const { keyworkerApiService } = services()

  return async (req, res, next) => {
    try {
      const userIsKeyworker =
        res.locals.user.userRoles.includes(AuthorisedRoles.KEYWORKER_MONITOR) ||
        (await keyworkerApiService.isKeyworker(
          req,
          res.locals.user.activeCaseLoad!.caseLoadId!,
          res.locals.user.username,
        ))

      res.locals.user.permissions = []

      if (res.locals.user.userRoles.includes(AuthorisedRoles.OMIC_ADMIN)) {
        res.locals.user.permissions.push(Permissions.Allocate)
      }

      if (userIsKeyworker) {
        res.locals.user.permissions.push(Permissions.View)
      }

      if (!res.locals.user.permissions.length) {
        return res.redirect('/not-authorised')
      }

      return next()
    } catch (e) {
      logger.error(e, `Failed to retrieve keyworker status: ${res.locals.user?.username}`)
      return next(e)
    }
  }
}
