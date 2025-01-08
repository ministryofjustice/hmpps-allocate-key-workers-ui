import { RequestHandler, Router } from 'express'
import logger from '../../logger'
import PrisonApiService from '../services/prisonApi/prisonApiService'
import { CaseLoad } from '../interfaces/caseLoad'

export default function checkPopulateUserCaseloads(prisonApiService: PrisonApiService): RequestHandler {
  const router = Router()
  router.use(async (req, res, next) => {
    try {
      if (res.locals.feComponentsMeta?.caseLoads) {
        res.locals.user.caseloads = res.locals.feComponentsMeta.caseLoads
      }
      if (res.locals.feComponentsMeta?.activeCaseLoad) {
        res.locals.user.activeCaseLoad = res.locals.feComponentsMeta.activeCaseLoad
      }
      const refetchCaseloads = !res.locals.user.caseloads
      if (refetchCaseloads) {
        const caseloads = await prisonApiService.getCaseLoads(req)
        res.locals.user.caseloads = caseloads as CaseLoad[]
        res.locals.user.activeCaseLoad =
          (caseloads as CaseLoad[])!.find(caseload => caseload.currentlyActive) ?? res.locals.user.activeCaseLoad
      }
    } catch (error) {
      logger.error(error, `Failed to get caseloads for: ${res.locals.user.username}`)
      next(error)
    }
    next()
  })
  return router
}
