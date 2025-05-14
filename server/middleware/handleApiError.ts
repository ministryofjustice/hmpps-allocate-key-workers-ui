import type { NextFunction, Request, Response } from 'express'
import type { HTTPError } from 'superagent'
import { FLASH_KEY__FORM_RESPONSES, FLASH_KEY__VALIDATION_ERRORS } from '../utils/constants'

export const handleApiError = (error: HTTPError, req: Request, res: Response, next: NextFunction) => {
  try {
    const errorRespData = JSON.parse(error.text) as { userMessage?: string }
    const errorMessage = errorRespData!.userMessage!
    if (errorMessage) {
      req.flash(
        FLASH_KEY__VALIDATION_ERRORS,
        JSON.stringify({
          apiError: [errorMessage],
        }),
      )
      req.flash(FLASH_KEY__FORM_RESPONSES, JSON.stringify(req.body))
      res.redirect(req.get('Referrer') || '/')
    } else {
      next(error)
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_e) {
    next(error)
  }
}
