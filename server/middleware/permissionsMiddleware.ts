import { NextFunction, Request, RequestHandler, Response } from 'express'
import { services } from '../services'
import logger from '../../logger'
import { HmppsUser, UserPermissionLevel } from '../interfaces/hmppsUser'
import { POLICIES } from './policyMiddleware'

export const requireRole = (minimumRole: UserPermissionLevel) => {
  return requirePermissionsAndConfig({ requirePrisonEnabled: true, minimumPermission: minimumRole })
}

export const hasPermission = (user: HmppsUser, permission: 'self' | 'view' | 'allocate' | 'admin') => {
  switch (permission) {
    case 'admin':
      return user.permissions >= UserPermissionLevel.ADMIN
    case 'allocate':
      return user.permissions >= UserPermissionLevel.ALLOCATE
    case 'view':
      return user.permissions >= UserPermissionLevel.VIEW
    case 'self':
      return user.permissions >= UserPermissionLevel.SELF_PROFILE_ONLY
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
        return res.redirect(`/${req.params['policy']}/not-authorised`)
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

      req.middleware ??= {}

      const policy = req.params['policy'] as string
      const policyConfig = POLICIES[policy]

      if (!policyConfig) {
        return res.notFound()
      }

      req.middleware.policy = policyConfig.jobResponsibility
      res.locals.policyStaff = policyConfig.staff
      res.locals.policyStaffs = policyConfig.staffs
      res.locals.policyPath = policyConfig.path
      res.locals.user.hasJobResponsibility = !!res.locals.user.allocationJobResponsibilities?.includes(
        policyConfig.jobResponsibility,
      )

      policyConfig.permissionMapper(res)

      if (res.locals.feComponents?.sharedData && res.locals.user.permissions !== UserPermissionLevel.ADMIN) {
        if (!res.locals.feComponents.sharedData.services.find(({ id }) => policyConfig.serviceNames.includes(id))) {
          return res.render('pages/service-not-enabled')
        }
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
