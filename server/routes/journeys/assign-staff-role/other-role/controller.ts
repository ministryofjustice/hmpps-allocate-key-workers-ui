import { Request, Response } from 'express'
import KeyworkerApiService from '../../../../services/keyworkerApi/keyworkerApiService'
import { getStaffRoles, parseRole } from '../common/utils'
import { SchemaType } from './schema'

export class SelectOtherRoleController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response) => {
    res.render('assign-staff-role/other-role/view', {
      backUrl: 'role',
      roles: (await getStaffRoles(this.keyworkerApiService, req, 'OTHER_OPTIONS')).map(({ code, description }) => ({
        value: code,
        text: description,
      })),
      role: parseRole(req.journeyData.assignStaffRole!.role).otherRole?.code,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.assignStaffRole!.role = req.body.role
    res.redirect(req.journeyData.isCheckAnswers ? 'check-answers' : 'working-pattern')
  }
}
