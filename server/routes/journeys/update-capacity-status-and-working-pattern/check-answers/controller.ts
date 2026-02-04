import { NextFunction, Request, Response } from 'express'
import AllocationsApiService from '../../../../services/allocationsApi/allocationsApiService'
import { FLASH_KEY__SUCCESS_MESSAGE } from '../../../../utils/constants'
import { possessiveComma } from '../../../../utils/formatUtils'
import { startNewJourney } from '../common/utils'
import { parseStaffDetails } from '../utils'

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
    const staffDetails = req.journeyData.staffDetails!
    try {
      if (status!.code === 'ACTIVE') {
        await this.allocationsApiService.upsertStaffDetails(req as Request, res, staffDetails.staffId, {
          ...parseStaffDetails(staffDetails),
          status: status!.code,
          deactivateActiveAllocations: false,
        })
      } else {
        await this.allocationsApiService.upsertStaffDetails(req as Request, res, staffDetails.staffId, {
          ...parseStaffDetails(staffDetails),
          status: status!.code,
          deactivateActiveAllocations: deactivateActiveAllocations!,
          ...(status?.code === 'UNAVAILABLE_ANNUAL_LEAVE' ? { reactivateOn: reactivateOn! } : {}),
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
    await startNewJourney(req, res)
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
