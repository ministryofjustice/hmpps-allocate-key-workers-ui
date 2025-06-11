import { NextFunction, Request, RequestHandler, Response } from 'express'
import { services } from '../services'
import logger from '../../logger'
import AuthorisedRoles from '../authentication/authorisedRoles'
import { HmppsUser, UserPermissionLevel } from '../interfaces/hmppsUser'

function hasRole(res: Response, ...roles: AuthorisedRoles[]): boolean {
  return roles.some(role => res.locals.user.userRoles.includes(role))
}

export const requireAllocateRole = (req: Request, res: Response, next: NextFunction) => {
  if (res.locals.user.permissions >= UserPermissionLevel.ALLOCATE) {
    return next()
  }

  return res.redirect(req.headers['referer'] || '/')
}

export const hasPermission = (user: HmppsUser, permission: 'view' | 'allocate' | 'admin') => {
  switch (permission) {
    case 'admin':
      return user.permissions >= UserPermissionLevel.ADMIN
    case 'allocate':
      return user.permissions >= UserPermissionLevel.ALLOCATE
    case 'view':
      return user.permissions >= UserPermissionLevel.VIEW
    default:
      return false
  }
}

type PermissionCriteria = {
  requirePrisonEnabled: boolean
  minimumPermission: UserPermissionLevel
}

enum PermissionResult {
  ALLOW,
  NOT_AUTHORISED,
  SERVICE_NOT_ENABLED,
}

const checkPermission = (criteria: PermissionCriteria, req: Request, res: Response): PermissionResult => {
  if (criteria.requirePrisonEnabled && !req.middleware!.prisonConfiguration!.isEnabled) {
    return PermissionResult.SERVICE_NOT_ENABLED
  }
  if (res.locals.user.permissions >= criteria.minimumPermission) {
    return PermissionResult.ALLOW
  }
  return PermissionResult.NOT_AUTHORISED
}

export const requirePermissionsAndConfig =
  (...criteriaList: PermissionCriteria[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    let result: PermissionResult = PermissionResult.NOT_AUTHORISED
    for (const criteria of criteriaList) {
      result = checkPermission(criteria, req, res)
      if (result === PermissionResult.ALLOW) break
    }
    switch (result) {
      case PermissionResult.ALLOW:
        return next()
      case PermissionResult.NOT_AUTHORISED:
        return res.redirect('/not-authorised')
      case PermissionResult.SERVICE_NOT_ENABLED:
      default:
        return res.render('pages/service-not-enabled')
    }
  }

export function populateUserPermissionsAndPrisonConfig(): RequestHandler {
  const { keyworkerApiService } = services()

  return async (req, res, next) => {
    try {
      const prisonCode = res.locals.user.getActiveCaseloadId()!

      const userViewPermission =
        res.locals.user.userRoles.includes(AuthorisedRoles.KEYWORKER_MONITOR) ||
        (await keyworkerApiService.isKeyworker(req, prisonCode, res.locals.user.username))

      if (hasRole(res, AuthorisedRoles.KW_MIGRATION)) {
        res.locals.user.permissions = UserPermissionLevel.ADMIN
      } else if (hasRole(res, AuthorisedRoles.OMIC_ADMIN)) {
        res.locals.user.permissions = UserPermissionLevel.ALLOCATE
      } else if (userViewPermission) {
        res.locals.user.permissions = UserPermissionLevel.VIEW
      }

      req.middleware ??= {}
      switch (req.params['policy']) {
        case 'key-worker':
          req.middleware.policy = 'KEY_WORKER'
          res.locals.policyName = 'key worker'
          res.locals.policyPath = 'key-worker'
          break
        case 'personal-officer':
          req.middleware.policy = 'PERSONAL_OFFICER'
          res.locals.policyName = 'personal officer'
          res.locals.policyPath = 'personal-officer'
          break
        default:
          return res.notFound()
      }

      req.middleware.prisonConfiguration = await keyworkerApiService.getPrisonConfig(req, prisonCode)

      return next()
    } catch (e) {
      logger.error(e, `Failed to retrieve keyworker status: ${res.locals.user?.username}`)
      return res.render('pages/errorServiceProblem', {
        showBreadcrumbs: true,
      })
    }
  }
}
