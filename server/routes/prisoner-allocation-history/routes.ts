import { PrisonerBasePermission, prisonerPermissionsGuard } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { PrisonerAllocationHistoryController } from './controller'
import { Page } from '../../services/auditService'

export const PrisonerAllocationHistoryRoutes = ({ allocationsApiService, prisonPermissionsService }: Services) => {
  const { router, get } = JourneyRouter()
  const controller = new PrisonerAllocationHistoryController(allocationsApiService)
  const populatePrisonerDataMiddleware = prisonerPermissionsGuard(prisonPermissionsService, {
    requestDependentOn: [PrisonerBasePermission.read],
    getPrisonerNumberFunction: req => req.params['prisonerId'] as string,
  })

  get(
    '/:prisonerId{/:policy}',
    Page.PRISONER_ALLOCATION_HISTORY,
    (req, res, next) => {
      res.setAuditDetails.prisonNumber(req.params['prisonerId'] as string)
      next()
    },
    populatePrisonerDataMiddleware,
    controller.GET,
  )

  return router
}
