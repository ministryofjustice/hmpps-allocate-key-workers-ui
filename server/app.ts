import express from 'express'
import * as Sentry from '@sentry/node'
import dpsComponents from '@ministryofjustice/hmpps-connect-dps-components'

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
import checkPopulateUserCaseloads from './middleware/checkPopulateUserCaseloads'
import populateClientToken from './middleware/populateSystemClientToken'

export default function createApp(services: Services): express.Application {
  const app = express()

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
      includeMeta: true,
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

  app.use(checkPopulateUserCaseloads(services.prisonApiService))
  app.use(routes(services))

  if (config.sentry.dsn) Sentry.setupExpressErrorHandler(app)

  app.use((_req, res) => res.notFound())
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
