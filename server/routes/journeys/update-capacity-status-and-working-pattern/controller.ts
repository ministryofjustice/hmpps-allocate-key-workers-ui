import { Request, Response } from 'express'
import { FLASH_KEY__SUCCESS_MESSAGE } from '../../../utils/constants'

export class UpdateCapacityAndStatusController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.updateStaffDetails ??= {}

    res.render('journeys/update-capacity-status-and-working-pattern/view', {
      ...req.journeyData.staffDetails!,
      backLabel: `Back to ${res.locals.policyStaff} profile`,
      backUrl: `back`,
      successMessage: req.flash(FLASH_KEY__SUCCESS_MESSAGE)[0],
    })
  }
}
