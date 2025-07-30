export const FLASH_KEY__VALIDATION_ERRORS = 'validationErrors'
export const FLASH_KEY__FORM_RESPONSES = 'formResponses'
export const FLASH_KEY__SUCCESS_MESSAGE = 'successMessage'
export const FLASH_KEY__COUNT = 'count'
export const FLASH_KEY__API_ERROR = 'apiError'

export type AllocateResult = {
  type: AllocateResultType
  count?: number
  staffCount?: number
}
export enum AllocateResultType {
  SUCCESS = 'SUCCESS',
  NO_CAPACITY_FOR_AUTO_ALLOCATION = 'NO_CAPACITY_FOR_AUTO_ALLOCATION',
}
export const FLASH_KEY__ALLOCATE_RESULT = 'allocateError'

export type Policy = {
  staff: string
  staffs: string
  path: string
  name: string
}

export const POLICIES = {
  'key-worker': { staff: 'key worker', staffs: 'key workers', path: 'key-worker', name: 'Key worker' },
  'personal-officer': {
    staff: 'personal officer',
    staffs: 'personal officers',
    path: 'personal-officer',
    name: 'Personal officer',
  },
}
