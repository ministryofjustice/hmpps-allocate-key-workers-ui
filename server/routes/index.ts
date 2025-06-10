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
import { StaffDataRoutes } from './staff-data/routes'
import { populateUserPermissions } from '../middleware/permissionsMiddleware'
import { JourneyRouter } from './base/routes'
import breadcrumbs from '../middleware/breadcrumbs'

export default function routes(services: Services) {
  const { router, get } = JourneyRouter()
  const controller = new HomePageController()

  router.use(populateUserPermissions())
  router.use(breadcrumbs())

  get('/', controller.GET)

  router.use(removeTrailingSlashMiddleware)

  router.use('/staff-statistics', StaffStatisticsRoutes(services))
  router.use('/staff-profile/:staffId', StaffProfileRoutes(services))
  router.use('/allocate-staff', AllocateStaffRoutes(services))
  router.use('/prisoner-allocation-history', PrisonerAllocationHistoryRoutes(services))
  router.use('/establishment-settings', EstablishmentSettingsRoutes(services))
  router.use('/staff-data', StaffDataRoutes(services))
  router.use('/manage-staff', StaffMembersRoutes(services))

  router.use(insertJourneyIdentifier())
  router.use('/:journeyId', JourneyRoutes(dataAccess(), services))

  return router
}
