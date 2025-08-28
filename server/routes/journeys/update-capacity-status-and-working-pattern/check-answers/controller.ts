import { NextFunction, Request, Response } from 'express'
import AllocationsApiService from '../../../../services/allocationsApi/allocationsApiService'
import { FLASH_KEY__SUCCESS_MESSAGE } from '../../../../utils/constants'
import { resetJourneyAndReloadKeyWorkerDetails } from '../common/utils'
import { possessiveComma } from '../../../../utils/formatUtils'

export class UpdateStatusCheckAnswersController {
  constructor(private readonly allocationsApiService: AllocationsApiService) {}

  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true

    const { status, deactivateActiveAllocations, reactivateOn } = req.journeyData.updateStaffDetails!

    res.render('journeys/update-capacity-status-and-working-pattern/check-answers/view', {
      ...req.journeyData.staffDetails!,
      newStatus: status,
      deactivateActiveAllocations,
      reactivateOn,
      backUrl: this.getBackUrl(req.journeyData.updateStaffDetails!.status!.code),
    })
  }

  submitToApi = async (req: Request, res: Response, next: NextFunction) => {
    const { status, deactivateActiveAllocations, reactivateOn } = req.journeyData.updateStaffDetails!
    try {
      if (status!.code === 'ACTIVE') {
        await this.allocationsApiService.upsertStaffDetails(
          req as Request,
          res,
          req.journeyData.staffDetails!.staffId,
          {
            status: status!.code,
            reactivateOn: null,
          },
        )
      } else {
        await this.allocationsApiService.upsertStaffDetails(
          req as Request,
          res,
          req.journeyData.staffDetails!.staffId,
          {
            status: status!.code,
            deactivateActiveAllocations: deactivateActiveAllocations!,
            reactivateOn: status?.code === 'UNAVAILABLE_ANNUAL_LEAVE' ? reactivateOn! : null,
          },
        )
      }

      req.flash(
        FLASH_KEY__SUCCESS_MESSAGE,
        `You have updated this ${possessiveComma(res.locals.policyStaff!)} status to ${status!.description}.`,
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

  private getBackUrl = (statusCode: string) => {
    switch (statusCode) {
      case 'ACTIVE':
        return 'update-status'
      case 'UNAVAILABLE_ANNUAL_LEAVE':
        return 'update-status-annual-leave-return'
      default:
        return 'update-status-unavailable'
    }
  }
}
