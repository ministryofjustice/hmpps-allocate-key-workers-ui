import { Request, Response } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'

export class UpdateCapacityAndStatusController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response, staffId: string): Promise<void> => {
    const prisonCode = res.locals.user.getActiveCaseloadId()!
    const keyworkerData = await this.keyworkerApiService.getKeyworkerDetails(req, prisonCode, staffId)

    const keyworkerStatuses = await this.keyworkerApiService.getKeyworkerStatuses(req)
    const statuses = keyworkerStatuses.map(keyworkerStatus => {
      return { value: keyworkerStatus.code, text: keyworkerStatus.description }
    })

    res.render('update-capacity-status/view', {
      ...keyworkerData,
      statuses,
      showBreadcrumbs: true,
      updated: req.query['updated'] === 'true',
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const prisonCode = res.locals.user.getActiveCaseloadId()!
    const staffId = req.params['staffId'] as string
    const updatedCapacity = req.body.capacity as number
    const updatedStatus = req.body.status as string

    const success = await this.keyworkerApiService.updateKeyworkerProperties(
      req,
      prisonCode,
      staffId,
      updatedCapacity,
      updatedStatus,
    )

    return res.redirect(`/key-worker-profile/${staffId}/update-capacity-status?updated=${success}`)
  }
}
