import express, { Router } from 'express'
import { FLASH_KEY__VALIDATION_ERRORS } from '../../utils/constants'

export default function redirectCheckAnswersMiddleware(excludePaths: RegExp[] = []): Router {
  const router = express.Router({ mergeParams: true })

  router.use((req, res, next) => {
    if (req.originalUrl && !excludePaths.some(itm => req.originalUrl.match(itm))) {
      const subPaths = req.originalUrl.split('/')
      const checkAnswersUrl = subPaths.length === 3 ? `${subPaths[2]}/check-answers` : 'check-answers'

      const resRender = res.render
      res.render = (view: string, options?) => {
        if (options && 'backUrl' in options && options.backUrl && req.journeyData.isCheckAnswers) {
          resRender.call(res, view, { ...options, backUrl: checkAnswersUrl } as never)
        } else {
          resRender.call(res, view, options as never)
        }
      }

      const resRedirect: (status: number, url: string) => void = res.redirect
      res.redirect = (param1: string | number, param2?: string | number) => {
        const url = (typeof param1 === 'string' ? param1 : param2) as string
        // eslint-disable-next-line no-nested-ternary
        const status = typeof param1 === 'number' ? param1 : typeof param2 === 'number' ? param2 : undefined
        const errors = req.flash(FLASH_KEY__VALIDATION_ERRORS)
        if (errors.length) {
          req.flash(FLASH_KEY__VALIDATION_ERRORS, errors[0]!)
        }
        resRedirect.call(res, status || 302, req.journeyData.isCheckAnswers && errors.length ? checkAnswersUrl : url)
      }
    }
    next()
  })
  return router
}
