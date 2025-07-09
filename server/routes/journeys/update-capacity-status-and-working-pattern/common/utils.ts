import { Request, Response } from 'express'
import KeyworkerApiService from '../../../../services/keyworkerApi/keyworkerApiService'

export const resetJourneyAndReloadKeyWorkerDetails = async (
  service: KeyworkerApiService,
  req: Request,
  res: Response,
) => {
  delete req.journeyData.updateStaffDetails
  delete req.journeyData.isCheckAnswers
  req.journeyData.staffDetails = await service.getStaffDetails(
    req as Request,
    res.locals.user.getActiveCaseloadId()!,
    req.journeyData.staffDetails!.staffId,
  )
}
