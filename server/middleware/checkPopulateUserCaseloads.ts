import { RequestHandler, Router } from 'express'
import { validate as uuidValidate } from 'uuid'
import logger from '../../logger'
import PrisonApiService from '../services/prisonApi/prisonApiService'
import KeyworkerApiService from '../services/keyworkerApi/keyworkerApiService'
import { ServiceConfigInfo } from '../services/keyworkerApi/keyworkerApiClient'
import { CaseLoad } from '../interfaces/caseLoad'

export default function checkPopulateUserCaseloads(
  prisonApiService: PrisonApiService,
  keyworkerApiService: KeyworkerApiService,
): RequestHandler {
  const router = Router()

  router.get('/service-not-enabled', (_req, res) => {
    res.status(200)
    res.render('service-not-enabled')
  })

  router.use(async (req, res, next) => {
    const splitUrl = req.url.split('/').filter(Boolean)
    const services = res.locals.feComponentsMeta?.services
    let isEligibleForService = services
      ? services.find(service => service.id === 'keyworkerUI') !== undefined
      : undefined
    let caseloads
    try {
      if (res.locals.feComponentsMeta?.caseLoads) {
        res.locals.user.caseloads = res.locals.feComponentsMeta.caseLoads
      }
      if (res.locals.feComponentsMeta?.activeCaseLoad) {
        res.locals.user.activeCaseLoad = res.locals.feComponentsMeta.activeCaseLoad
      }
      const refetchCaseloads = !res.locals.user.caseloads
      if (refetchCaseloads) {
        caseloads = caseloads ?? (await prisonApiService.getCaseLoads(req))
        res.locals.user.caseloads = caseloads as CaseLoad[]
        res.locals.user.activeCaseLoad =
          (caseloads as CaseLoad[])!.find(caseload => caseload.currentlyActive) ?? res.locals.user.activeCaseLoad
      }

      // Check that the user's active caseload is enabled on the API side
      if (
        req.method === 'GET' &&
        !uuidValidate(splitUrl[0] || '') &&
        !req.url.endsWith('/start') &&
        !req.url.includes('prisoner-image') &&
        !req.url.includes('service-not-enabled')
      ) {
        if (isEligibleForService === undefined) {
          const configInfo = await keyworkerApiService.getServiceConfigInfo(req)
          const { activeAgencies } = configInfo as ServiceConfigInfo
          isEligibleForService =
            activeAgencies.includes(
              res.locals.user.caseloads!.find(caseload => caseload.currentlyActive)?.caseLoadId || '',
            ) || activeAgencies.includes('***')
        }
        if (!isEligibleForService) {
          res.redirect('/service-not-enabled')
          return
        }
      }
    } catch (error) {
      logger.error(error, `Failed to get caseloads for: ${res.locals.user.username}`)
      next(error)
    }
    next()
  })
  return router
}
