import { Request, Response } from 'express'
import AllocationsApiService from '../../../../services/allocationsApi/allocationsApiService'

export const resetJourneyAndReloadKeyWorkerDetails = async (
  service: AllocationsApiService,
  req: Request,
  res: Response,
) => {
  delete req.journeyData.updateStaffDetails
  delete req.journeyData.isCheckAnswers
  req.journeyData.staffDetails = await service.getStaffDetails(
    req as Request,
    res.locals.user.getActiveCaseloadId()!,
    req.journeyData.staffDetails!.staffId,
    false,
  )
}
