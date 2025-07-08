import type { Services } from '../services'
import { HomePageController } from './controller'
import { StaffMembersRoutes } from './manage/routes'
import { StaffProfileRoutes } from './staff-profile/routes'
import { AllocateStaffRoutes } from './allocate/routes'
import { PrisonerAllocationHistoryRoutes } from './prisoner-allocation-history/routes'
import removeTrailingSlashMiddleware from '../middleware/removeTrailingSlashMiddleware'
import insertJourneyIdentifier from '../middleware/journey/insertJourneyIdentifier'
import JourneyRoutes from './journeys/routes'
import { dataAccess } from '../data'
import { EstablishmentSettingsRoutes } from './establishment-settings/routes'
import { RecommendStaffAutomaticallyRoutes } from './recommend-allocations/routes'
import { StaffDataRoutes } from './data/routes'
import {
  populateUserPermissionsAndPrisonConfig,
  requirePermissionsAndConfig,
} from '../middleware/permissionsMiddleware'
import { JourneyRouter } from './base/routes'
import breadcrumbs from '../middleware/breadcrumbs'
import { UserPermissionLevel } from '../interfaces/hmppsUser'
import { ManageRolesRoutes } from './manage-roles/routes'

export default function routes(services: Services) {
  const { router, get } = JourneyRouter()
  const controller = new HomePageController()

  router.use(populateUserPermissionsAndPrisonConfig())
  router.use(breadcrumbs())

  const adminOverridingPermission = requirePermissionsAndConfig(
    {
      requirePrisonEnabled: false,
      minimumPermission: UserPermissionLevel.ADMIN,
    },
    {
      requirePrisonEnabled: true,
      minimumPermission: UserPermissionLevel.SELF_PROFILE_ONLY,
    },
  )

  get('/', adminOverridingPermission, controller.GET)

  router.use(removeTrailingSlashMiddleware)

  router.use(
    '/establishment-settings',
    requirePermissionsAndConfig(
      {
        requirePrisonEnabled: false,
        minimumPermission: UserPermissionLevel.ADMIN,
      },
      {
        requirePrisonEnabled: true,
        minimumPermission: UserPermissionLevel.ALLOCATE,
      },
    ),
    EstablishmentSettingsRoutes(services),
  )

  router.use(
    requirePermissionsAndConfig({
      requirePrisonEnabled: true,
      minimumPermission: UserPermissionLevel.SELF_PROFILE_ONLY,
    }),
  )

  router.use('/staff-profile/:staffId', StaffProfileRoutes(services))

  router.use(requirePermissionsAndConfig({ requirePrisonEnabled: true, minimumPermission: UserPermissionLevel.VIEW }))

  router.use('/allocate', AllocateStaffRoutes(services))
  router.use('/prisoner-allocation-history', PrisonerAllocationHistoryRoutes(services))
  router.use('/data', StaffDataRoutes(services))
  router.use('/manage', StaffMembersRoutes(services))

  router.use(
    requirePermissionsAndConfig({ requirePrisonEnabled: true, minimumPermission: UserPermissionLevel.ALLOCATE }),
  )
  router.use('/manage-roles', ManageRolesRoutes())
  router.use('/recommend-allocations', RecommendStaffAutomaticallyRoutes(services))

  router.use(insertJourneyIdentifier())
  router.use('/:journeyId', JourneyRoutes(dataAccess(), services))

  return router
}
