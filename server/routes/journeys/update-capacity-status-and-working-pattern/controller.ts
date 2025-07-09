import { Request, Response } from 'express'
import { FLASH_KEY__SUCCESS_MESSAGE } from '../../../utils/constants'

export class UpdateCapacityAndStatusController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.updateStaffDetails ??= {}
    const staffDetails = req.journeyData.staffDetails!

    res.render('journeys/update-capacity-status-and-working-pattern/view', {
      ...req.journeyData.staffDetails!,
      backLabel: `Back to ${res.locals.policyName} profile`,
      backUrl: `/${res.locals.policyPath}/staff-profile/${staffDetails.staffId}`,
      successMessage: req.flash(FLASH_KEY__SUCCESS_MESSAGE)[0],
    })
  }
}
