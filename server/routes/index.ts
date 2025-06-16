import type { Services } from '../services'
import { HomePageController } from './controller'
import { StaffStatisticsRoutes } from './staff-statistics/routes'
import { StaffMembersRoutes } from './manage-staff/routes'
import { StaffProfileRoutes } from './staff-profile/routes'
import { AllocateStaffRoutes } from './allocate-staff/routes'
import { PrisonerAllocationHistoryRoutes } from './prisoner-allocation-history/routes'
import removeTrailingSlashMiddleware from '../middleware/removeTrailingSlashMiddleware'
import insertJourneyIdentifier from '../middleware/journey/insertJourneyIdentifier'
import JourneyRoutes from './journeys/routes'
import { dataAccess } from '../data'
import { EstablishmentSettingsRoutes } from './establishment-settings/routes'
import { RecommendStaffAutomaticallyRoutes } from './recommend-staff-automatically/routes'
import { StaffDataRoutes } from './staff-data/routes'
import {
  populateUserPermissionsAndPrisonConfig,
  requirePermissionsAndConfig,
} from '../middleware/permissionsMiddleware'
import { JourneyRouter } from './base/routes'
import breadcrumbs from '../middleware/breadcrumbs'
import { UserPermissionLevel } from '../interfaces/hmppsUser'
import { ManageStaffRolesRoutes } from './manage-staff-roles/routes'

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
      minimumPermission: UserPermissionLevel.VIEW,
    },
  )

  get('/', adminOverridingPermission, controller.GET)

  router.use(removeTrailingSlashMiddleware)

  router.use('/establishment-settings', adminOverridingPermission, EstablishmentSettingsRoutes(services))
  router.use(
    '/staff-profile/:staffId',
    requirePermissionsAndConfig({
      requirePrisonEnabled: false,
      minimumPermission: UserPermissionLevel.VIEW,
    }),
    StaffProfileRoutes(services),
  )

  router.use(
    requirePermissionsAndConfig({
      requirePrisonEnabled: true,
      minimumPermission: UserPermissionLevel.VIEW,
    }),
  )

  router.use('/staff-statistics', StaffStatisticsRoutes(services))
  router.use('/allocate-staff', AllocateStaffRoutes(services))
  router.use('/prisoner-allocation-history', PrisonerAllocationHistoryRoutes(services))
  router.use('/establishment-settings', EstablishmentSettingsRoutes(services))
  router.use('/recommend-staff-automatically', RecommendStaffAutomaticallyRoutes(services))
  router.use('/staff-data', StaffDataRoutes(services))
  router.use('/manage-staff', StaffMembersRoutes(services))
  router.use('/manage-staff-roles', ManageStaffRolesRoutes())

  router.use(insertJourneyIdentifier())
  router.use('/:journeyId', JourneyRoutes(dataAccess(), services))

  return router
}
