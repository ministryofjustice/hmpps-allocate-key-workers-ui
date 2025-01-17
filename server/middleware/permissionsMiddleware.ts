import { RequestHandler } from 'express'
import { services } from '../services'
import logger from '../../logger'

export default function populateUserPermissions(): RequestHandler {
  const { keyworkerApiService } = services()

  return async (req, res, next) => {
    try {
      const userIsKeyworker = await keyworkerApiService.isKeyworker(
        req,
        res.locals.user.activeCaseLoad!.caseLoadId!,
        res.locals.user.username,
      )

      res.locals.user.permissions = []

      if (res.locals.user.userRoles.includes('OMIC_ADMIN')) {
        res.locals.user.permissions.push('allocate')
      }

      if (userIsKeyworker) {
        res.locals.user.permissions.push('view')
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
