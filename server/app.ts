import express from 'express'
import * as Sentry from '@sentry/node'
import dpsComponents from '@ministryofjustice/hmpps-connect-dps-components'

// @ts-expect-error Import untyped middleware for cypress coverage
import cypressCoverage from '@cypress/code-coverage/middleware/express'

import './sentry'
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
import breadcrumbs from './middleware/breadcrumbs'
import populateUserPermissions from './middleware/permissionsMiddleware'
import populateValidationErrors from './middleware/populateValidationErrors'

export default function createApp(services: Services): express.Application {
  const app = express()

  if (process.env.NODE_ENV === 'e2e-test') {
    cypressCoverage(app)
  }

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  app.use(sentryMiddleware())
  app.use(appInsightsMiddleware())
  app.use(setUpHealthChecks(services.applicationInfo))
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  nunjucksSetup(app)
  app.use(setUpAuthentication())
  app.use(authorisationMiddleware())
  app.use(setUpCsrf())
  app.use(setUpCurrentUser())
  app.use(populateClientToken())
  app.get(
    '*',
    dpsComponents.getPageComponents({
      logger,
      includeSharedData: true,
      dpsUrl: config.serviceUrls.digitalPrison,
      timeoutOptions: {
        response: config.apis.componentApi.timeout.response,
        deadline: config.apis.componentApi.timeout.deadline,
      },
    }),
  )
  app.use((_req, res, next) => {
    res.notFound = () => res.status(404).render('pages/not-found')
    next()
  })
  app.use(breadcrumbs())
  app.use(dpsComponents.retrieveCaseLoadData({ logger }))
  app.use(populateValidationErrors())

  app.get('/not-authorised', (_, res) => {
    res.status(403)
    res.render('not-authorised', { showBreadcrumbs: true })
  })

  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  app.use(populateUserPermissions())
  app.use(routes(services))

  if (config.sentry.dsn) Sentry.setupExpressErrorHandler(app)

  app.use((_req, res) => res.notFound())

  return app
}
