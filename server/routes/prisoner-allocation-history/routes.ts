import { PrisonerBasePermission, prisonerPermissionsGuard } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { PrisonerAllocationHistoryController } from './controller'

export const PrisonerAllocationHistoryRoutes = ({ keyworkerApiService, prisonPermissionsService }: Services) => {
  const { router, get } = JourneyRouter()
  const controller = new PrisonerAllocationHistoryController(keyworkerApiService)
  const populatePrisonerDataMiddleware = prisonerPermissionsGuard(prisonPermissionsService, {
    requestDependentOn: [PrisonerBasePermission.read],
    getPrisonerNumberFunction: req => req.params['prisonerId'] as string,
  })

  get('/:prisonerId', populatePrisonerDataMiddleware, controller.GET)

  return router
}
