import { Request, Response } from 'express'
import { components } from '../../../../@types/keyWorker'
import KeyworkerApiService from '../../../../services/keyworkerApi/keyworkerApiService'

export const getUpdateCapacityStatusSuccessMessage = (
  statusCode: string,
  capacity: number,
  keyworkerDetails: components['schemas']['StaffDetails'],
) => {
  const subjects: string[] = []
  if (keyworkerDetails.status.code !== statusCode) {
    subjects.push('status')
  }
  if (keyworkerDetails.capacity !== capacity) {
    subjects.push('capacity')
  }
  // fallback success message in case the status is the same, but user updated the allocation options
  if (subjects.length === 0) {
    subjects.push('status')
  }

  return `You have updated this key worker’s ${subjects.join(' and ')}.`
}

export const resetJourneyAndReloadKeyWorkerDetails = async (
  service: KeyworkerApiService,
  req: Request,
  res: Response,
) => {
  delete req.journeyData.updateCapacityStatus
  delete req.journeyData.isCheckAnswers
  req.journeyData.keyWorkerDetails = await service.getStaffDetails(
    req as Request,
    res.locals.user.getActiveCaseloadId()!,
    req.journeyData.keyWorkerDetails!.staffId,
  )
}
