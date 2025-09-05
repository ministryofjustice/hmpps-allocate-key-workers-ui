import { NextFunction, Request, Response } from 'express'
import { FLASH_KEY__SUCCESS_MESSAGE } from '../../../../utils/constants'
import AllocationsApiService from '../../../../services/allocationsApi/allocationsApiService'
import { SchemaType } from '../../manage-roles/assign/working-pattern/schema'
import { startNewJourney } from '../common/utils'
import { possessiveComma } from '../../../../utils/formatUtils'

export class UpdateWorkingPatternController {
  constructor(private readonly allocationsApiService: AllocationsApiService) {}

  GET = async (req: Request, res: Response) => {
    res.render('journeys/update-capacity-status-and-working-pattern/update-working-pattern/view', {
      ...req.journeyData.staffDetails!,
      scheduleType: req.journeyData.staffDetails!.staffRole!.scheduleType!.code,
      backUrl: '../update-capacity-status-and-working-pattern',
    })
  }

  submitToApi = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const { scheduleType } = req.body
    const staffDetails = req.journeyData.staffDetails!

    try {
      await this.allocationsApiService.upsertStaffDetails(req as Request, res, staffDetails.staffId, {
        staffRole: {
          scheduleType: scheduleType.code,
          hoursPerWeek: scheduleType.hoursPerWeek,
        },
      })
      req.flash(
        FLASH_KEY__SUCCESS_MESSAGE,
        `You have updated this ${possessiveComma(res.locals.policyStaff!)} working pattern.`,
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
