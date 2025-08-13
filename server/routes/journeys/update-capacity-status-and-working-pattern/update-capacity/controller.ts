import { NextFunction, Request, Response } from 'express'
import { FLASH_KEY__SUCCESS_MESSAGE } from '../../../../utils/constants'
import KeyworkerApiService from '../../../../services/keyworkerApi/keyworkerApiService'
import { resetJourneyAndReloadKeyWorkerDetails } from '../common/utils'
import { SchemaType } from './schema'
import { possessiveComma } from '../../../../utils/formatUtils'

export class UpdateCapacityController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response) => {
    res.render('journeys/update-capacity-status-and-working-pattern/update-capacity/view', {
      ...req.journeyData.staffDetails!,
      capacity: res.locals.formResponses?.['capacity'] ?? req.journeyData.staffDetails!.capacity,
      backUrl: '../update-capacity-status-and-working-pattern',
    })
  }

  submitToApi = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const { capacity } = req.body
    const staffDetails = req.journeyData.staffDetails!

    try {
      await this.keyworkerApiService.upsertStaffDetails(req as Request, res, staffDetails.staffId, { capacity })
      req.flash(
        FLASH_KEY__SUCCESS_MESSAGE,
        `You have updated this ${possessiveComma(res.locals.policyStaff!)} maximum capacity.`,
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
