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

type PermissionCriteria = {
  requirePrisonEnabled: boolean
  hasAnyOfRoles: ('admin' | 'view' | 'allocate')[]
}

type PermissionResult = 'allow' | 'not-authorised' | 'service-not-enabled'

const checkPermission = (criteria: PermissionCriteria, req: Request, res: Response): PermissionResult => {
  if (criteria.requirePrisonEnabled && !req.middleware!.prisonConfiguration!.isEnabled) {
    return 'service-not-enabled'
  }
  for (const role of criteria.hasAnyOfRoles) {
    switch (role) {
      case 'admin':
        if (res.locals.user.permissions.admin) return 'allow'
        break
      case 'allocate':
        if (res.locals.user.permissions.allocate) return 'allow'
        break
      case 'view':
        if (res.locals.user.permissions.view) return 'allow'
        break
      default:
        break
    }
  }
  return 'not-authorised'
}

export const requirePermissionsAndConfig =
  (...criteriaList: PermissionCriteria[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    let result: PermissionResult = 'service-not-enabled'
    for (const criteria of criteriaList) {
      result = checkPermission(criteria, req, res)
      if (result === 'allow') break
    }
    switch (result) {
      case 'allow':
        return next()
      case 'not-authorised':
        return res.redirect('/not-authorised')
      case 'service-not-enabled':
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

      res.locals.user.permissions = {
        view: userViewPermission || hasRole(res, AuthorisedRoles.OMIC_ADMIN, AuthorisedRoles.KW_MIGRATION),
        allocate: hasRole(res, AuthorisedRoles.OMIC_ADMIN, AuthorisedRoles.KW_MIGRATION),
        admin: hasRole(res, AuthorisedRoles.KW_MIGRATION),
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
