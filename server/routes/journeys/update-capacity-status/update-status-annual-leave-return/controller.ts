import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { getDateFromDateInput, getDateInputValuesFromDate } from '../../../../utils/validation/dateSchema'

export class UpdateStatusReturnDateController {
  GET = async (req: Request, res: Response) => {
    const { day, month, year } = getDateInputValuesFromDate(req.journeyData.updateCapacityStatus!.reactivateOn)
    res.render('journeys/update-capacity-status/update-status-annual-leave-return/view', {
      ...req.journeyData.keyWorkerDetails!,
      day: res.locals?.formResponses?.['day'] ?? day,
      month: res.locals?.formResponses?.['month'] ?? month,
      year: res.locals?.formResponses?.['year'] ?? year,
      backUrl: 'update-status-unavailable',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.updateCapacityStatus!.reactivateOn = getDateFromDateInput(req.body)
    res.redirect('check-answers')
  }
}
