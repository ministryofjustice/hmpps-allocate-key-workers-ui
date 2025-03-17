import { Request, Response } from 'express'
import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { ProfileSummaryController } from './controller'

export const ProfileSummaryRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get } = JourneyRouter()
  const controller = new ProfileSummaryController(keyworkerApiService)

  get('/:staffId', async (req: Request, res: Response) => {
    const staffId = req.params['staffId'] as string

    await controller.GET(req, res, staffId)
  })

  return router
}
