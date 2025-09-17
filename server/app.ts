import express from 'express'
import {
  getFrontendComponents,
  retrieveCaseLoadData,
  retrieveAllocationJobResponsibilities,
} from '@ministryofjustice/hmpps-connect-dps-components'
import * as Sentry from '@sentry/node'
import './sentry'

// @ts-expect-error Import untyped middleware for cypress coverage
import cypressCoverage from '@cypress/code-coverage/middleware/express'

import config from './config'

import nunjucksSetup from './utils/nunjucksSetup'
import logger from '../logger'
import errorHandler from './errorHandler'
import { appInsightsMiddleware } from './utils/azureAppInsights'
import authorisationMiddleware from './middleware/authorisationMiddleware'

import setUpAuthentication from './middleware/setUpAuthentication'
import setUpCsrf from './middleware/setUpCsrf'
import setUpCurrentUser from './middleware/setUpCurrentUser'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpWebSession from './middleware/setUpWebSession'
import sentryMiddleware from './middleware/sentryMiddleware'

import routes from './routes'
import type { Services } from './services'
import populateClientToken from './middleware/populateSystemClientToken'
import { handleApiError } from './middleware/handleApiError'
import { auditPageViewMiddleware } from './middleware/audit/auditPageViewMiddleware'
import { auditApiCallMiddleware } from './middleware/audit/auditApiCallMiddleware'

export default function createApp(services: Services): express.Application {
  const app = express()

  if (process.env.NODE_ENV === 'e2e-test') {
    cypressCoverage(app)
  }

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  app.use(express.urlencoded({ extended: true, parameterLimit: 10000 }))
  app.use(sentryMiddleware())
  app.use(appInsightsMiddleware())
  app.use(setUpHealthChecks(services.applicationInfo))
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  nunjucksSetup(app)
  app.use(setUpAuthentication(services))
  app.get('*any', auditPageViewMiddleware(services.auditService))
  app.post('*any', auditApiCallMiddleware(services.auditService))
  app.use(authorisationMiddleware())
  app.use(setUpCsrf())
  app.use(setUpCurrentUser())
  app.use(populateClientToken(services.hmppsAuthClient))

  app.get(
    /(.*)/,
    getFrontendComponents({
      logger,
      requestOptions: { includeSharedData: true },
      componentApiConfig: config.apis.componentApi,
      dpsUrl: config.serviceUrls.digitalPrison,
      authenticationClient: services.authenticationClient,
    }),
  )
  app.use((_req, res, next) => {
    res.notFound = () => res.status(404).render('pages/not-found')
    next()
  })

  app.use(
    retrieveCaseLoadData({
      logger,
      prisonApiConfig: config.apis.prisonApi,
      authenticationClient: services.authenticationClient,
    }),
  )
  app.use(
    retrieveAllocationJobResponsibilities({
      logger,
      allocationsApiConfig: config.apis.keyworkerApi,
      authenticationClient: services.authenticationClient,
    }),
  )

  app.get('/:policy/not-authorised', (req, res) => {
    res.status(403)
    res.render('not-authorised', { showBreadcrumbs: true, policyStaff: req.params['policy'].replace('-', ' ') })
  })

  app.use('/:policy', routes(services))

  if (config.sentry.dsn) Sentry.setupExpressErrorHandler(app)

  app.use((_req, res) => res.notFound())
  app.use(handleApiError)
  app.use(errorHandler(process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'e2e-test'))
  return app
}
