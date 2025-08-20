import { UserPermissionLevel } from '../interfaces/hmppsUser'
import { requirePermissionsAndConfig } from '../middleware/permissionsMiddleware'

const permissionAdmin = { requirePrisonEnabled: false, minimumPermission: UserPermissionLevel.ADMIN }
const permissionAllocate = { requirePrisonEnabled: true, minimumPermission: UserPermissionLevel.ALLOCATE }
const permissionSelf = { requirePrisonEnabled: true, minimumPermission: UserPermissionLevel.SELF_PROFILE_ONLY }

export const minRequireAdmin = requirePermissionsAndConfig(permissionAdmin)
export const minRequireAllocate = requirePermissionsAndConfig(permissionAllocate)
export const minRequireSelfProfile = requirePermissionsAndConfig(permissionSelf)
export const minRequireView = requirePermissionsAndConfig({
  requirePrisonEnabled: true,
  minimumPermission: UserPermissionLevel.VIEW,
})
export const minRequireAdminOrAllocate = requirePermissionsAndConfig(permissionAdmin, permissionAllocate)
export const minRequireAdminOrSelf = requirePermissionsAndConfig(permissionAdmin, permissionSelf)
