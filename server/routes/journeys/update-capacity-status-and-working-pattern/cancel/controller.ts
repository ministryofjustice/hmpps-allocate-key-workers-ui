import { Request, Response } from 'express'
import { startNewJourney } from '../common/utils'

export class CancelUpdateStatusController {
  constructor() {}

  GET = async (req: Request, res: Response) => {
    await startNewJourney(req, res)
  }
}
