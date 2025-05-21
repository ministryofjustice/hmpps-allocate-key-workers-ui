import { NextFunction, Request, Response } from 'express'
import KeyworkerApiService from '../../../services/keyworkerApi/keyworkerApiService'
import { FLASH_KEY__FORM_RESPONSES } from '../../../utils/constants'
import { SchemaType } from './schema'

export class UpdateCapacityAndStatusController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response) => {
    res.render('key-worker-profile/update-capacity-status/view', {
      ...req.journeyData.keyWorkerDetails!,
      statuses: (await this.keyworkerApiService.getReferenceData(req, 'keyworker-status')).map(
        ({ code, description }) => ({ value: code, text: description }),
      ),
      backUrl: `/key-worker-profile/${req.journeyData.keyWorkerDetails!.keyworker.staffId}`,
      updated: res.locals[FLASH_KEY__FORM_RESPONSES]?.updateSuccess || false,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const { capacity, status } = req.body

    try {
      await this.keyworkerApiService.updateKeyworkerProperties(
        req as Request,
        res,
        res.locals.user.getActiveCaseloadId()!,
        req.journeyData.keyWorkerDetails!.keyworker.staffId,
        capacity,
        status,
      )

      req.journeyData.keyWorkerDetails = await this.keyworkerApiService.getKeyworkerDetails(
        req as Request,
        res.locals.user.getActiveCaseloadId()!,
        req.journeyData.keyWorkerDetails!.keyworker.staffId,
      )

      req.flash(FLASH_KEY__FORM_RESPONSES, JSON.stringify({ updateSuccess: true }))
    } catch (e) {
      next(e)
    }

    return res.redirect(`update-capacity-status`)
  }
}
