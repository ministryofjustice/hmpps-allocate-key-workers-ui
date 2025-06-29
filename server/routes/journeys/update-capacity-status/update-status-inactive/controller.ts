import { NextFunction, Request, Response } from 'express'
import KeyworkerApiService from '../../../../services/keyworkerApi/keyworkerApiService'
import { FLASH_KEY__SUCCESS_MESSAGE } from '../../../../utils/constants'
import { getUpdateCapacityStatusSuccessMessage, resetJourneyAndReloadKeyWorkerDetails } from '../common/utils'

export class UpdateStatusInactiveController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response) => {
    res.render('journeys/update-capacity-status/update-status-inactive/view', {
      ...req.journeyData.keyWorkerDetails!,
      backUrl: '../update-capacity-status',
    })
  }

  submitToApi = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.keyworkerApiService.updateStaffConfig(
        req as Request,
        res,
        res.locals.user.getActiveCaseloadId()!,
        req.journeyData.keyWorkerDetails!.staffId,
        {
          status: req.journeyData.updateCapacityStatus!.status!.code,
          capacity: req.journeyData.updateCapacityStatus!.capacity!,
          deactivateActiveAllocations: true,
          removeFromAutoAllocation: true,
        },
      )

      req.flash(
        FLASH_KEY__SUCCESS_MESSAGE,
        getUpdateCapacityStatusSuccessMessage(
          req.journeyData.updateCapacityStatus!.status!.code,
          req.journeyData.updateCapacityStatus!.capacity!,
          req.journeyData.keyWorkerDetails!,
          res.locals.policyName!,
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
