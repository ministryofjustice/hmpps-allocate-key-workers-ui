import type { Services } from '../services'
import { HomePageController } from './controller'
import { StaffMembersRoutes } from './manage/routes'
import { StaffProfileRoutes } from './staff-profile/routes'
import { AllocateStaffRoutes } from './allocate/routes'
import { PrisonerAllocationHistoryRoutes } from './prisoner-allocation-history/routes'
import removeTrailingSlashMiddleware from '../middleware/removeTrailingSlashMiddleware'
import insertJourneyIdentifier from '../middleware/journey/insertJourneyIdentifier'
import JourneyRoutes from './journeys/routes'
import { EstablishmentSettingsRoutes } from './establishment-settings/routes'
import { RecommendStaffAutomaticallyRoutes } from './recommend-allocations/routes'
import { StaffDataRoutes } from './data/routes'
import { populateUserPermissionsAndPrisonConfig } from '../middleware/permissionsMiddleware'
import { JourneyRouter } from './base/routes'
import breadcrumbs from '../middleware/breadcrumbs'
import { ManageRolesRoutes } from './manage-roles/routes'
import { Page } from '../services/auditService'
import { POStaffDataRoutes } from './data-personal-officer/routes'
import { historyMiddleware } from '../middleware/historyMiddleware'
import { POStaffProfileRoutes } from './staff-profile-personal-officer/routes'
import {
  minRequireAdminOrAllocate,
  minRequireAdminOrSelf,
  minRequireAllocate,
  minRequireSelfProfile,
  minRequireView,
} from './permissions'

export default function routes(services: Services) {
  const { router, get, useForPolicies } = JourneyRouter()
  const controller = new HomePageController()

  router.use(populateUserPermissionsAndPrisonConfig(services))
  router.use(breadcrumbs())

  router.use(historyMiddleware())
  get('/', Page.HOMEPAGE, minRequireAdminOrSelf, controller.GET)

  router.use(removeTrailingSlashMiddleware)

  router.use('/establishment-settings', minRequireAdminOrAllocate, EstablishmentSettingsRoutes(services))

  router.use('/prisoner-allocation-history', minRequireSelfProfile, PrisonerAllocationHistoryRoutes(services))
  useForPolicies('/staff-profile/:staffId', minRequireSelfProfile, {
    KEY_WORKER: StaffProfileRoutes(services),
    PERSONAL_OFFICER: POStaffProfileRoutes(services),
  })

  router.use('/allocate', minRequireView, AllocateStaffRoutes(services))
  useForPolicies('/data', minRequireView, {
    KEY_WORKER: StaffDataRoutes(services),
    PERSONAL_OFFICER: POStaffDataRoutes(services),
  })
  router.use('/manage', minRequireView, StaffMembersRoutes(services))

  router.use('/manage-roles', minRequireAllocate, ManageRolesRoutes())
  router.use('/recommend-allocations', minRequireAllocate, RecommendStaffAutomaticallyRoutes(services))
  router.use(insertJourneyIdentifier())
  router.use('/:journeyId', JourneyRoutes(services))

  return router
}
