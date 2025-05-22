import { NextFunction, Request, Response } from 'express'
import KeyworkerApiService from '../../../services/keyworkerApi/keyworkerApiService'
import { FLASH_KEY__SUCCESS_MESSAGE } from '../../../utils/constants'
import { SchemaType } from './schema'
import { getUpdateCapacityStatusSuccessMessage, resetJourneyAndReloadKeyWorkerDetails } from './common/utils'

export class UpdateCapacityAndStatusController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response) => {
    req.journeyData.updateCapacityStatus ??= {}

    res.render('journeys/update-capacity-status/view', {
      ...req.journeyData.keyWorkerDetails!,
      capacity:
        res.locals.formResponses?.['capacity'] ??
        req.journeyData.updateCapacityStatus!.capacity ??
        req.journeyData.keyWorkerDetails!.capacity,
      statusCode:
        res.locals.formResponses?.['status'] ??
        req.journeyData.updateCapacityStatus!.status?.code ??
        req.journeyData.keyWorkerDetails!.status?.code,
      statuses: (await this.keyworkerApiService.getReferenceData(req, 'keyworker-status')).map(
        ({ code, description }) => ({ value: code, text: description }),
      ),
      backUrl: `/key-worker-profile/${req.journeyData.keyWorkerDetails!.keyworker.staffId}`,
      successMessage: req.flash(FLASH_KEY__SUCCESS_MESSAGE)[0],
    })
  }

  submitToApi = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const { capacity, status } = req.body
    try {
      // special logic: save both capacity and status only if status=ACTIVE, otherwise, save capacity only
      await this.keyworkerApiService.updateKeyworkerProperties(
        req as Request,
        res,
        res.locals.user.getActiveCaseloadId()!,
        req.journeyData.keyWorkerDetails!.keyworker.staffId,
        {
          status: status.code === 'ACTIVE' ? status.code : req.journeyData.keyWorkerDetails!.status.code,
          capacity,
          deactivateActiveAllocations: false,
          removeFromAutoAllocation: false,
        },
      )

      if (status.code === 'ACTIVE') {
        req.flash(
          FLASH_KEY__SUCCESS_MESSAGE,
          getUpdateCapacityStatusSuccessMessage(status.code, capacity, req.journeyData.keyWorkerDetails!),
        )
      }

      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    const { capacity, status } = req.body

    req.journeyData.updateCapacityStatus!.status = status
    req.journeyData.updateCapacityStatus!.capacity = capacity

    switch (status.code) {
      case 'UNAVAILABLE_ANNUAL_LEAVE':
        if (req.journeyData.isCheckAnswers && !req.journeyData.updateCapacityStatus!.reactivateOn) {
          delete req.journeyData.isCheckAnswers
        }
        return res.redirect(
          req.journeyData.isCheckAnswers
            ? 'update-capacity-status/check-answers'
            : 'update-capacity-status/update-status-unavailable',
        )
      case 'UNAVAILABLE_LONG_TERM_ABSENCE':
      case 'UNAVAILABLE_NO_PRISONER_CONTACT':
        return res.redirect(
          req.journeyData.isCheckAnswers
            ? 'update-capacity-status/check-answers'
            : 'update-capacity-status/update-status-unavailable',
        )
      case 'INACTIVE':
        return res.redirect('update-capacity-status/update-status-inactive')
      case 'ACTIVE':
      default:
        await resetJourneyAndReloadKeyWorkerDetails(this.keyworkerApiService, req as Request, res)
        return res.redirect('update-capacity-status')
    }
  }
}
