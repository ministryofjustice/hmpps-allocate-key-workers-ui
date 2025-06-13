import { NextFunction, Request, Response } from 'express'
import KeyworkerApiService from '../../../../../services/keyworkerApi/keyworkerApiService'

export class AssignRoleCheckAnswersController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response) => {
    if (!req.journeyData.assignStaffRole!.isPrisonOfficer) {
      return res.redirect('not-prison-officer')
    }

    req.journeyData.isCheckAnswers = true

    const { staff, scheduleType } = req.journeyData.assignStaffRole!

    return res.render('journeys/manage-staff-roles/assign/check-answers/view', {
      staff,
      scheduleType,
      backUrl: 'working-pattern',
    })
  }

  submitToApi = async (req: Request, res: Response, next: NextFunction) => {
    const { staff, scheduleType, hoursPerWeek } = req.journeyData.assignStaffRole!
    try {
      await this.keyworkerApiService.assignRoleToStaff(
        req,
        res,
        staff!.staffId,
        'PRO',
        scheduleType!.code,
        hoursPerWeek!,
      )
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('confirmation')
  }
}
