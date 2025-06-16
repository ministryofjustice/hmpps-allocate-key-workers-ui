import { NextFunction, Request, Response } from 'express'
import KeyworkerApiService from '../../../../services/keyworkerApi/keyworkerApiService'
import { FLASH_KEY__SUCCESS_MESSAGE } from '../../../../utils/constants'
import { getUpdateCapacityStatusSuccessMessage, resetJourneyAndReloadKeyWorkerDetails } from '../common/utils'

export class UpdateStatusCheckAnswersController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true

    const { status, deactivateActiveAllocations, removeFromAutoAllocation, reactivateOn } =
      req.journeyData.updateCapacityStatus!

    res.render('journeys/update-capacity-status/check-answers/view', {
      ...req.journeyData.keyWorkerDetails!,
      newStatus: status,
      deactivateActiveAllocations,
      removeFromAutoAllocation,
      reactivateOn,
      backUrl:
        req.journeyData.updateCapacityStatus!.status?.code === 'UNAVAILABLE_ANNUAL_LEAVE'
          ? 'update-status-annual-leave-return'
          : 'update-status-unavailable',
    })
  }

  submitToApi = async (req: Request, res: Response, next: NextFunction) => {
    const { status, capacity, deactivateActiveAllocations, removeFromAutoAllocation, reactivateOn } =
      req.journeyData.updateCapacityStatus!
    try {
      await this.keyworkerApiService.updateStaffConfig(
        req as Request,
        res,
        res.locals.user.getActiveCaseloadId()!,
        req.journeyData.keyWorkerDetails!.staffId,
        {
          status: status!.code,
          capacity: capacity!,
          deactivateActiveAllocations: deactivateActiveAllocations!,
          removeFromAutoAllocation: removeFromAutoAllocation!,
          ...(status?.code === 'UNAVAILABLE_ANNUAL_LEAVE' ? { reactivateOn } : {}),
        },
      )

      req.flash(
        FLASH_KEY__SUCCESS_MESSAGE,
        getUpdateCapacityStatusSuccessMessage(
          req.journeyData.updateCapacityStatus!.status!.code,
          req.journeyData.updateCapacityStatus!.capacity!,
          req.journeyData.keyWorkerDetails!,
        ),
      )

      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (req: Request, res: Response) => {
    await resetJourneyAndReloadKeyWorkerDetails(this.keyworkerApiService, req, res)
    res.redirect('../update-capacity-status')
  }
}
