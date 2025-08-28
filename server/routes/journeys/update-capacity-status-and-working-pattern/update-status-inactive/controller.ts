import { NextFunction, Request, Response } from 'express'
import AllocationsApiService from '../../../../services/allocationsApi/allocationsApiService'
import { FLASH_KEY__SUCCESS_MESSAGE } from '../../../../utils/constants'
import { resetJourneyAndReloadKeyWorkerDetails } from '../common/utils'
import { possessiveComma } from '../../../../utils/formatUtils'

export class UpdateStatusInactiveController {
  constructor(private readonly allocationsApiService: AllocationsApiService) {}

  GET = async (req: Request, res: Response) => {
    res.render('journeys/update-capacity-status-and-working-pattern/update-status-inactive/view', {
      ...req.journeyData.staffDetails!,
      backUrl: '../update-capacity-status-and-working-pattern',
    })
  }

  submitToApi = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.allocationsApiService.upsertStaffDetails(req as Request, res, req.journeyData.staffDetails!.staffId, {
        status: req.journeyData.updateStaffDetails!.status!.code,
        reactivateOn: null,
        deactivateActiveAllocations: true,
      })

      req.flash(
        FLASH_KEY__SUCCESS_MESSAGE,
        `You have updated this ${possessiveComma(res.locals.policyStaff!)} status to ${req.journeyData.updateStaffDetails!.status!.description}.`,
      )

      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (req: Request, res: Response) => {
    await resetJourneyAndReloadKeyWorkerDetails(this.allocationsApiService, req, res)
    res.redirect('../update-capacity-status-and-working-pattern')
  }
}
