import type { Services } from '../services'
import { HomePageController } from './controller'
import { KeyWorkerStatisticsRoutes } from './key-worker-statistics/routes'
import { KeyWorkerMembersRoutes } from './manage-key-workers/routes'
import { KeyWorkerProfileRoutes } from './key-worker-profile/routes'
import { AllocateKeyWorkerRoutes } from './allocate-key-workers/routes'
import { PrisonerAllocationHistoryRoutes } from './prisoner-allocation-history/routes'
import removeTrailingSlashMiddleware from '../middleware/removeTrailingSlashMiddleware'
import insertJourneyIdentifier from '../middleware/journey/insertJourneyIdentifier'
import JourneyRoutes from './journeys/routes'
import { dataAccess } from '../data'
import { EstablishmentSettingsRoutes } from './establishment-settings/routes'
import { KeyWorkersDataRoutes } from './key-workers-data/routes'
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

  router.use('/key-worker-statistics', KeyWorkerStatisticsRoutes(services))
  router.use('/key-worker-profile/:staffId', KeyWorkerProfileRoutes(services))
  router.use('/allocate-key-workers', AllocateKeyWorkerRoutes(services))
  router.use('/prisoner-allocation-history', PrisonerAllocationHistoryRoutes(services))
  router.use('/establishment-settings', EstablishmentSettingsRoutes(services))
  router.use('/key-workers-data', KeyWorkersDataRoutes(services))
  router.use('/manage-key-workers', KeyWorkerMembersRoutes(services))

  router.use(insertJourneyIdentifier())
  router.use('/:journeyId', JourneyRoutes(dataAccess(), services))

  return router
}
