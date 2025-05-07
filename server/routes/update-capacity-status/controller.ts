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
    })
  }
}
