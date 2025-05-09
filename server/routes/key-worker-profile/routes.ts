import { Request, Response } from 'express'
import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'
import { KeyWorkerProfileController } from './controller'

export const KeyWorkerProfileRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new KeyWorkerProfileController(keyworkerApiService)

  get('/:staffId', async (req: Request, res: Response) => {
    const staffId = req.params['staffId'] as string

    await controller.GET(req, res, staffId)
  })

  post('/:staffId', controller.POST)

  return router
}
