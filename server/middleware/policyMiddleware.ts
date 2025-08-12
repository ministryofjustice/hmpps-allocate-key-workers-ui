import { Response } from 'express'
import AuthorisedRoles from '../authentication/authorisedRoles'
import { UserPermissionLevel } from '../interfaces/hmppsUser'

export type Policy = {
  staff: string
  staffs: string
  path: string
  name: string
  jobResponsibility: 'KEY_WORKER' | 'PERSONAL_OFFICER'
  serviceNames: string[]
  permissionMapper: (res: Response) => void
}

function hasRole(res: Response, ...roles: AuthorisedRoles[]): boolean {
  return roles.some(role => res.locals.user.userRoles.includes(role))
}

export const POLICIES: Record<string, Policy> = {
  'key-worker': {
    staff: 'key worker',
    staffs: 'key workers',
    path: 'key-worker',
    name: 'Key worker',
    jobResponsibility: 'KEY_WORKER',
    serviceNames: ['allocate-key-workers', 'my-key-worker-allocations'],
    permissionMapper: (res: Response) => {
      if (hasRole(res, AuthorisedRoles.KW_MIGRATION)) {
        res.locals.user.permissions = UserPermissionLevel.ADMIN
      } else if (hasRole(res, AuthorisedRoles.OMIC_ADMIN)) {
        res.locals.user.permissions = UserPermissionLevel.ALLOCATE
      } else if (hasRole(res, AuthorisedRoles.KEYWORKER_MONITOR)) {
        res.locals.user.permissions = UserPermissionLevel.VIEW
      } else if (res.locals.user.hasJobResponsibility) {
        res.locals.user.permissions = UserPermissionLevel.SELF_PROFILE_ONLY
      }
    },
  },
  'personal-officer': {
    staff: 'personal officer',
    staffs: 'personal officers',
    path: 'personal-officer',
    name: 'Personal officer',
    jobResponsibility: 'PERSONAL_OFFICER',
    serviceNames: ['allocate-personal-officers', 'my-personal-officer-allocations'],
    permissionMapper: (res: Response) => {
      if (hasRole(res, AuthorisedRoles.KW_MIGRATION)) {
        res.locals.user.permissions = UserPermissionLevel.ADMIN
      } else if (hasRole(res, AuthorisedRoles.PERSONAL_OFFICER_ALLOCATE)) {
        res.locals.user.permissions = UserPermissionLevel.ALLOCATE
      } else if (hasRole(res, AuthorisedRoles.PERSONAL_OFFICER_VIEW)) {
        res.locals.user.permissions = UserPermissionLevel.VIEW
      } else if (res.locals.user.hasJobResponsibility) {
        res.locals.user.permissions = UserPermissionLevel.SELF_PROFILE_ONLY
      }
    },
  },
}
