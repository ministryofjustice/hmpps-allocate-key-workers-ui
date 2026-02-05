import { NextFunction, Request, Response } from 'express'
import AllocationsApiService from '../../../../../services/allocationsApi/allocationsApiService'

export class AssignRoleCheckAnswersController {
  constructor(private readonly allocationsApiService: AllocationsApiService) {}

  GET = async (req: Request, res: Response) => {
    if (!req.journeyData.assignStaffRole!.isPrisonOfficer && req.middleware?.policy !== 'PERSONAL_OFFICER') {
      return res.redirect('not-prison-officer')
    }

    req.journeyData.isCheckAnswers = true

    const { staff, scheduleType, capacity } = req.journeyData.assignStaffRole!

    return res.render('journeys/manage-roles/assign/check-answers/view', {
      staff,
      scheduleType,
      capacity,
      backUrl: 'working-pattern',
    })
  }

  submitToApi = async (req: Request, res: Response, next: NextFunction) => {
    const { staff, scheduleType, hoursPerWeek, capacity } = req.journeyData.assignStaffRole!

    await this.allocationsApiService.upsertStaffDetails(req, res, staff!.staffId, {
      deactivateActiveAllocations: false,
      status: 'ACTIVE',
      capacity: capacity!,
      staffRole: {
        position: 'PRO',
        scheduleType: scheduleType!.code,
        hoursPerWeek: hoursPerWeek!,
        fromDate: new Date().toISOString().substring(0, 10),
      },
    })
    next()
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('confirmation')
  }
}
