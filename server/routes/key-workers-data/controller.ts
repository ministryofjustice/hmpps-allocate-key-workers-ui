import { Request, Response } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'

export class KeyWorkersDataController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response) => {
    res.render('key-workers-data/view', {
      showBreadcrumbs: true,
    })
  }

  POST = async (req: Request, res: Response) => {}
}
