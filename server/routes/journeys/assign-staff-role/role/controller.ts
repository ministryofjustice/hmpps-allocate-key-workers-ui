import { Request, Response } from 'express'
import KeyworkerApiService from '../../../../services/keyworkerApi/keyworkerApiService'
import { getStaffRoles, parseRole } from '../common/utils'
import { SchemaType } from './schema'

export class SelectRoleController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response) => {
    res.render('assign-staff-role/role/view', {
      backUrl: req.journeyData.isCheckAnswers ? 'check-answers' : '../assign-staff-role',
      roles: (await getStaffRoles(this.keyworkerApiService, req, 'COMMON_OPTIONS')).map(({ code, description }) => ({
        value: code,
        text: description,
      })),
      role: parseRole(req.journeyData.assignStaffRole!.role).commonRole?.code,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    if (req.body.role.code === 'OTHER') {
      res.redirect('other-role')
    } else {
      req.journeyData.assignStaffRole!.role = req.body.role
      res.redirect(req.journeyData.isCheckAnswers ? 'check-answers' : 'working-pattern')
    }
  }
}
