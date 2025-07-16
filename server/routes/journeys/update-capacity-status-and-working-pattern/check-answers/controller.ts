import { NextFunction, Request, Response } from 'express'
import KeyworkerApiService from '../../../../services/keyworkerApi/keyworkerApiService'
import { FLASH_KEY__SUCCESS_MESSAGE } from '../../../../utils/constants'
import { resetJourneyAndReloadKeyWorkerDetails } from '../common/utils'
import { possessiveComma } from '../../../../utils/formatUtils'

export class UpdateStatusCheckAnswersController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

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
        await this.keyworkerApiService.upsertStaffDetails(req as Request, res, req.journeyData.staffDetails!.staffId, {
          status: status!.code,
        })
      } else {
        await this.keyworkerApiService.upsertStaffDetails(req as Request, res, req.journeyData.staffDetails!.staffId, {
          status: status!.code,
          deactivateActiveAllocations: deactivateActiveAllocations!,
          ...(status?.code === 'UNAVAILABLE_ANNUAL_LEAVE' ? { reactivateOn } : {}),
        })
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
    await resetJourneyAndReloadKeyWorkerDetails(this.keyworkerApiService, req, res)
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
