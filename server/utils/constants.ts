export const FLASH_KEY__VALIDATION_ERRORS = 'validationErrors'
export const FLASH_KEY__FORM_RESPONSES = 'formResponses'
export const FLASH_KEY__SUCCESS_MESSAGE = 'successMessage'
export const FLASH_KEY__COUNT = 'count'
export const FLASH_KEY__API_ERROR = 'apiError'

export type AllocateResult = {
  type: AllocateResultType
  count?: number
}
export enum AllocateResultType {
  SUCCESS = 'SUCCESS',
  NO_CAPACITY_FOR_AUTO_ALLOCATION = 'NO_CAPACITY_FOR_AUTO_ALLOCATION',
}
export const FLASH_KEY__ALLOCATE_RESULT = 'allocateError'
