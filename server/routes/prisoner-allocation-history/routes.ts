import { Request, Response } from 'express'
import { PrisonerBasePermission, prisonerPermissionsGuard } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { PrisonerAllocationHistoryController } from './controller'

export const PrisonerAllocationHistoryRoutes = ({ keyworkerApiService, prisonPermissionsService }: Services) => {
  console.log(`PrisonerAllocationHistoryRoutes check START`)
  const { router, get } = JourneyRouter()
  const controller = new PrisonerAllocationHistoryController(keyworkerApiService)
  const permissionGuard = prisonerPermissionsGuard(prisonPermissionsService, {
    requestDependentOn: [PrisonerBasePermission.read],
    getPrisonerNumberFunction: req => req.params['prisonerId'] as string,
  })

  get(
    '/:prisonerId',
    (_req, _res, next) => {
      console.log(`BEFORE CHECK`)
      next()
    },
    permissionGuard,
    async (req: Request, res: Response) => {
      const prisonerId = req.params['prisonerId'] as string

      await controller.GET(req, res, prisonerId)
    },
  )

  return router
}
