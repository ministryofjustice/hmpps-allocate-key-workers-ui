import { Request } from 'express'
import KeyworkerApiService from '../../../../services/keyworkerApi/keyworkerApiService'
import { ReferenceData } from '../../../../@types/express'

const COMMON_ROLE_CODES = ['PRO', 'PPO', 'PO']
const PSEUDO_COMMON_ROLE = {
  code: 'OTHER',
  description: 'Other',
}

export const getStaffRoles = async (
  keyworkerApiService: KeyworkerApiService,
  req: Request,
  list: 'COMMON_OPTIONS' | 'OTHER_OPTIONS',
) => {
  const roles = await keyworkerApiService.getReferenceData(req, 'staff-position')
  if (list === 'COMMON_OPTIONS') {
    return [...roles.filter(itm => COMMON_ROLE_CODES.includes(itm.code)), PSEUDO_COMMON_ROLE]
  }
  return roles.filter(itm => !COMMON_ROLE_CODES.includes(itm.code))
}

type ParseRoleResult = {
  commonRole?: ReferenceData
  otherRole?: ReferenceData
}

export const parseRole = (role?: ReferenceData): ParseRoleResult => {
  if (!role) {
    return {}
  }
  if (COMMON_ROLE_CODES.includes(role.code)) {
    return { commonRole: role }
  }
  return {
    commonRole: PSEUDO_COMMON_ROLE,
    otherRole: role,
  }
}
