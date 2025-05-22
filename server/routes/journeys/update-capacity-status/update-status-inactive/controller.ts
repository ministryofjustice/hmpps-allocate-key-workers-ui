import { NextFunction, Request, Response } from 'express'
import KeyworkerApiService from '../../../../services/keyworkerApi/keyworkerApiService'
import { FLASH_KEY__SUCCESS_MESSAGE } from '../../../../utils/constants'
import { getUpdateCapacityStatusSuccessMessage } from '../common/utils'

export class UpdateStatusInactiveController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response) => {
    res.render('journeys/update-capacity-status/update-status-inactive/view', {
      ...req.journeyData.keyWorkerDetails!,
      backUrl: '../update-capacity-status',
      updated: !!res.locals.formResponses?.['updateSuccess'],
    })
  }

  submitToApi = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.keyworkerApiService.updateKeyworkerProperties(
        req as Request,
        res,
        res.locals.user.getActiveCaseloadId()!,
        req.journeyData.keyWorkerDetails!.keyworker.staffId,
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
        ),
      )

      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (req: Request, res: Response) => {
    delete req.journeyData.updateCapacityStatus
    req.journeyData.keyWorkerDetails = await this.keyworkerApiService.getKeyworkerDetails(
      req as Request,
      res.locals.user.getActiveCaseloadId()!,
      req.journeyData.keyWorkerDetails!.keyworker.staffId,
    )
    res.redirect('../update-capacity-status')
  }
}
