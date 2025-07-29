import { NextFunction, Request, Response } from 'express'
import KeyworkerApiService from '../../../../../services/keyworkerApi/keyworkerApiService'

export class AssignRoleCheckAnswersController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response) => {
    if (!req.journeyData.assignStaffRole!.isPrisonOfficer && res.locals['policyPath'] !== 'personal-officer') {
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

    await this.keyworkerApiService.upsertStaffDetails(req, res, staff!.staffId, {
      ...(capacity !== req.middleware!.prisonConfiguration!.capacity ? { capacity } : {}),
      staffRole: {
        position: 'PRO',
        scheduleType: scheduleType!.code,
        hoursPerWeek: hoursPerWeek!,
      },
    })
    next()
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('confirmation')
  }
}
