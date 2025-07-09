import { Request, Response } from 'express'
import { SchemaType } from './schema'
import KeyworkerApiService from '../../../../services/keyworkerApi/keyworkerApiService'

export class UpdateStatusController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response) => {
    const staffDetails = req.journeyData.staffDetails!
    res.render('journeys/update-capacity-status-and-working-pattern/update-status/view', {
      ...staffDetails,
      statusCode: res.locals.formResponses?.['status'] ?? req.journeyData.updateStaffDetails!.status?.code,
      statuses: (await this.keyworkerApiService.getReferenceData(req, 'staff-status'))
        .filter(itm => itm.code !== staffDetails.status?.code)
        .map(({ code, description }) => ({
          value: code,
          text: description,
        })),
      backUrl: '../update-capacity-status-and-working-pattern',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    const { status } = req.body

    req.journeyData.updateStaffDetails!.status = status

    switch (status.code) {
      case 'UNAVAILABLE_ANNUAL_LEAVE':
        if (req.journeyData.isCheckAnswers && !req.journeyData.updateStaffDetails!.reactivateOn) {
          delete req.journeyData.isCheckAnswers
        }
        return res.redirect(req.journeyData.isCheckAnswers ? 'check-answers' : 'update-status-unavailable')
      case 'UNAVAILABLE_LONG_TERM_ABSENCE':
      case 'UNAVAILABLE_NO_PRISONER_CONTACT':
        return res.redirect(req.journeyData.isCheckAnswers ? 'check-answers' : 'update-status-unavailable')
      case 'INACTIVE':
        return res.redirect('update-status-inactive')
      case 'ACTIVE':
      default:
        return res.redirect('check-answers')
    }
  }
}
