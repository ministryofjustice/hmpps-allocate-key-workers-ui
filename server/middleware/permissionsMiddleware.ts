import { RequestHandler } from 'express'
import { services } from '../services'
import logger from '../../logger'
import AuthorisedRoles from '../authentication/authorisedRoles'

export default function populateUserPermissions(): RequestHandler {
  const { keyworkerApiService } = services()

  return async (req, res, next) => {
    try {
      const userViewPermission =
        res.locals.user.userRoles.includes(AuthorisedRoles.KEYWORKER_MONITOR) ||
        (await keyworkerApiService.isKeyworker(
          req,
          res.locals.user.activeCaseLoad!.caseLoadId!,
          res.locals.user.username,
        ))

      res.locals.user.permissions = {
        view: userViewPermission,
        allocate: res.locals.user.userRoles.includes(AuthorisedRoles.OMIC_ADMIN),
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
