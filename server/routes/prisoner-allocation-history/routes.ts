import { Request, Response } from 'express'
import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { PrisonerAllocationHistoryController } from './controller'

export const PrisonerAllocationHistoryRoutes = ({ prisonerSearchApiService, keyworkerApiService }: Services) => {
  const { router, get } = JourneyRouter()
  const controller = new PrisonerAllocationHistoryController(prisonerSearchApiService, keyworkerApiService)

  get('/:prisonerId', async (req: Request, res: Response) => {
    const prisonerId = req.params['prisonerId'] as string

    await controller.GET(req, res, prisonerId)
  })

  return router
}
