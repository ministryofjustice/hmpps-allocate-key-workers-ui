import { NextFunction, Request, Response } from 'express'
import { FLASH_KEY__SUCCESS_MESSAGE } from '../../../../utils/constants'
import AllocationsApiService from '../../../../services/allocationsApi/allocationsApiService'
import { startNewJourney } from '../common/utils'
import { SchemaType } from './schema'
import { possessiveComma } from '../../../../utils/formatUtils'
import { parseStaffDetails } from '../utils'

export class UpdateCapacityController {
  constructor(private readonly allocationsApiService: AllocationsApiService) {}

  GET = async (req: Request, res: Response) => {
    res.render('journeys/update-capacity-status-and-working-pattern/update-capacity/view', {
      ...req.journeyData.staffDetails!,
      capacity:
        res.locals.formResponses?.['capacity'] ??
        req.journeyData.staffDetails!.capacity ??
        req.middleware!.prisonConfiguration!.capacity,
      backUrl: '../update-capacity-status-and-working-pattern',
    })
  }

  submitToApi = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const { capacity } = req.body
    const staffDetails = req.journeyData.staffDetails!

    try {
      await this.allocationsApiService.upsertStaffDetails(req as Request, res, staffDetails.staffId, {
        ...parseStaffDetails(req.journeyData.staffDetails!),
        capacity,
        deactivateActiveAllocations: false,
      })
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
    await startNewJourney(req, res)
  }
}
