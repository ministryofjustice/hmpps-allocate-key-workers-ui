import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { getDateFromDateInput, getDateInputValuesFromDate } from '../../../../utils/validation/dateSchema'

export class UpdateStatusReturnDateController {
  GET = async (req: Request, res: Response) => {
    const { day, month, year } = getDateInputValuesFromDate(req.journeyData.updateStaffDetails!.reactivateOn)
    res.render('journeys/update-capacity-status-and-working-pattern/update-status-annual-leave-return/view', {
      ...req.journeyData.staffDetails!,
      day: res.locals?.formResponses?.['day'] ?? day,
      month: res.locals?.formResponses?.['month'] ?? month,
      year: res.locals?.formResponses?.['year'] ?? year,
      backUrl: 'update-status-unavailable',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.updateStaffDetails!.reactivateOn = getDateFromDateInput(req.body)
    res.redirect('check-answers')
  }
}
