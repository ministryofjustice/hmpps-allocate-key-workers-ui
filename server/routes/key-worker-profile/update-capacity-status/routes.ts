import { Request, Response } from 'express'
import { Services } from '../../../services'
import { JourneyRouter } from '../../base/routes'
import { UpdateCapacityAndStatusController } from './controller'

export const UpdateCapacityAndStatusRoutes = ({ keyworkerApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateCapacityAndStatusController(keyworkerApiService)

  get('/', async (req: Request, res: Response) => {
    const staffId = req.params['staffId'] as string

    await controller.GET(req, res, staffId)
  })

  post('/', controller.POST)

  return router
}
