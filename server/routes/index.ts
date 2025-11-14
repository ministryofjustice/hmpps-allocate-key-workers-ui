import type { Services } from '../services'
import { HomePageController } from './controller'
import { StaffMembersRoutes } from './manage/routes'
import { KWStaffProfileRoutes } from './staff-profile-key-worker/routes'
import { AllocateStaffRoutes } from './allocate/routes'
import { PrisonerAllocationHistoryRoutes } from './prisoner-allocation-history/routes'
import removeTrailingSlashMiddleware from '../middleware/removeTrailingSlashMiddleware'
import insertJourneyIdentifier from '../middleware/journey/insertJourneyIdentifier'
import JourneyRoutes from './journeys/routes'
import { EstablishmentSettingsRoutes } from './establishment-settings/routes'
import { RecommendStaffAutomaticallyRoutes } from './recommend-allocations/routes'
import { populateUserPermissionsAndPrisonConfig } from '../middleware/permissionsMiddleware'
import { JourneyRouter } from './base/routes'
import breadcrumbs from '../middleware/breadcrumbs'
import { ManageRolesRoutes } from './manage-roles/routes'
import { Page } from '../services/auditService'
import { StaffDataRoutes } from './data/routes'
import { historyMiddleware } from '../middleware/historyMiddleware'
import { POStaffProfileRoutes } from './staff-profile-personal-officer/routes'
import {
  minRequireAdminOrAllocate,
  minRequireAdminOrSelf,
  minRequireAllocate,
  minRequireSelfProfile,
  minRequireView,
} from './permissions'
import populateValidationErrors from '../middleware/populateValidationErrors'
import { sentenceCase } from '../utils/formatUtils'

export default function routes(services: Services) {
  const { router, get, useForPolicies } = JourneyRouter()
  const controller = new HomePageController()

  router.use(populateUserPermissionsAndPrisonConfig(services))
  router.use(breadcrumbs())

  router.use(
    historyMiddleware((_req, res) => [
      {
        matcher: new RegExp(`^/${res.locals.policyPath}/?$`, 'i'),
        text: sentenceCase(res.locals.policyStaffs!, true),
        alias: Page.HOMEPAGE,
      },
      { matcher: /\/allocate/g, text: `Allocate ${res.locals.policyStaffs!}`, alias: Page.ALLOCATE },
      {
        matcher: /recommend-allocations/g,
        text: `Allocate ${res.locals.policyStaffs!} automatically`,
        alias: Page.RECOMMENDED_ALLOCATIONS,
      },
      {
        matcher: /prisoner-allocation-history/g,
        text: 'Prisoner allocation history',
        alias: Page.PRISONER_ALLOCATION_HISTORY,
      },
      {
        matcher: /\/manage([^-]|$)/g,
        text: `Manage ${res.locals.policyStaffs!}`,
        alias: Page.MANAGE_ALLOCATABLE_STAFF,
      },
      { matcher: /\/manage-roles([^/]|$)/g, text: `Manage roles`, alias: Page.MANAGE_ROLES },
      {
        matcher: /\/staff-profile\/[^/]+(\/case-notes)?/g,
        text: `${sentenceCase(res.locals.policyStaff!)} profile`,
        alias: Page.STAFF_PROFILE,
      },
    ]),
  )

  router.use(populateValidationErrors())

  get('/', Page.HOMEPAGE, minRequireAdminOrSelf, controller.GET)

  router.use(removeTrailingSlashMiddleware)

  router.use('/establishment-settings', minRequireAdminOrAllocate, EstablishmentSettingsRoutes(services))

  router.use('/prisoner-allocation-history', minRequireSelfProfile, PrisonerAllocationHistoryRoutes(services))
  useForPolicies('/staff-profile/:staffId', minRequireSelfProfile, {
    KEY_WORKER: KWStaffProfileRoutes(services),
    PERSONAL_OFFICER: POStaffProfileRoutes(services),
  })

  router.use('/allocate', minRequireView, AllocateStaffRoutes(services))
  router.use('/data', minRequireView, StaffDataRoutes(services))
  router.use('/manage', minRequireView, StaffMembersRoutes(services))

  router.use('/manage-roles', minRequireAllocate, ManageRolesRoutes())
  router.use('/recommend-allocations', minRequireAllocate, RecommendStaffAutomaticallyRoutes(services))

  router.use('/:journeyId', JourneyRoutes(services))
  router.use(insertJourneyIdentifier())

  return router
}
