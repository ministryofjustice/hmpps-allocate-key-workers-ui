import { Request, Response } from 'express'
import path from 'path'
import PrisonApiService from '../services/prisonApi/prisonApiService'

const placeHolderImage = path.join(process.cwd(), '/dist/assets/images/prisoner-profile-image.png')

export default class PrisonerImageRoutes {
  constructor(private readonly prisonerImageService: PrisonApiService) {}

  GET = async (req: Request, res: Response) => {
    const { prisonerNumber } = req.params

    return this.prisonerImageService
      .getPrisonerImage(req, prisonerNumber as string)
      .then(data => {
        res.set('Cache-control', 'private, max-age=86400')
        res.removeHeader('pragma')
        res.type('image/jpeg')
        data.pipe(res)
      })
      .catch(_error => {
        res.sendFile(placeHolderImage)
      })
  }
}
