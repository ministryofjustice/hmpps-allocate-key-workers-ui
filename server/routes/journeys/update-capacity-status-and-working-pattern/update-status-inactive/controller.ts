import { NextFunction, Request, Response } from 'express'
import KeyworkerApiService from '../../../../services/keyworkerApi/keyworkerApiService'
import { FLASH_KEY__SUCCESS_MESSAGE } from '../../../../utils/constants'
import { resetJourneyAndReloadKeyWorkerDetails } from '../common/utils'

export class UpdateStatusInactiveController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response) => {
    res.render('journeys/update-capacity-status-and-working-pattern/update-status-inactive/view', {
      ...req.journeyData.staffDetails!,
      backUrl: '../update-capacity-status-and-working-pattern',
    })
  }

  submitToApi = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.keyworkerApiService.upsertStaffDetails(req as Request, res, req.journeyData.staffDetails!.staffId, {
        status: req.journeyData.updateStaffDetails!.status!.code,
        allowAutoAllocation: false,
        deactivateActiveAllocations: true,
      })

      req.flash(
        FLASH_KEY__SUCCESS_MESSAGE,
        `You have updated this ${res.locals.policyName}’s status to ${req.journeyData.updateStaffDetails!.status!.description}.`,
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
}
