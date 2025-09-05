import { Request, Response } from 'express'

export const startNewJourney = async (req: Request, res: Response) => {
  req.journeyData.journeyCompleted = true
  return res.redirect(
    `/${res.locals.policyPath}/start-update-staff/${req.journeyData.staffDetails?.staffId}?proceedTo=update-capacity-status-and-working-pattern&history=${req.journeyData.b64History}`,
  )
}
