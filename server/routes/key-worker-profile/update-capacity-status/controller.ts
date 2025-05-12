import { Request, Response } from 'express'
import KeyworkerApiService from '../../../services/keyworkerApi/keyworkerApiService'
import { FLASH_KEY__FORM_RESPONSES } from '../../../utils/constants'

export class UpdateCapacityAndStatusController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response, staffId: string) => {
    const prisonCode = res.locals.user.getActiveCaseloadId()!
    const updated = res.locals[FLASH_KEY__FORM_RESPONSES]?.updateSuccess || false
    const keyworkerData = await this.keyworkerApiService.getKeyworkerDetails(req, prisonCode, staffId)
    const keyworkerStatuses = await this.keyworkerApiService.getKeyworkerStatuses(req)
    const statuses = keyworkerStatuses.map(keyworkerStatus => {
      return { value: keyworkerStatus.code, text: keyworkerStatus.description }
    })

    res.render('key-worker-profile/update-capacity-status/view', {
      ...keyworkerData,
      statuses,
      showBreadcrumbs: true,
      updated,
    })
  }

  POST = async (req: Request, res: Response) => {
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

    req.flash(FLASH_KEY__FORM_RESPONSES, JSON.stringify({ updateSuccess: success }))

    return res.redirect(`/key-worker-profile/${staffId}/update-capacity-status`)
  }
}
