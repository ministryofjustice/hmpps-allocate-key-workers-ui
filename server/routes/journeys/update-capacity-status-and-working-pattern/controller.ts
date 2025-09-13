import { Request, Response } from 'express'
import { FLASH_KEY__SUCCESS_MESSAGE } from '../../../utils/constants'
import { createBackUrlFor } from '../../../middleware/historyMiddleware'

export class UpdateCapacityAndStatusController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.updateStaffDetails ??= {}
    const staffDetails = req.journeyData.staffDetails!

    const backUrl = createBackUrlFor(
      res,
      /staff-profile/,
      `/${res.locals.policyPath}/staff-profile/${staffDetails.staffId}`,
    )

    res.render('journeys/update-capacity-status-and-working-pattern/view', {
      ...req.journeyData.staffDetails!,
      backLabel: `Back to ${res.locals.policyStaff} profile`,
      backUrl,
      successMessage: req.flash(FLASH_KEY__SUCCESS_MESSAGE)[0],
    })
  }
}
