import * as Sentry from '@sentry/node'
import config from './config'

if (config.sentry.dsn) {
  Sentry.initWithoutDefaultIntegrations({
    dsn: config.sentry.dsn,
    environment: config.sentry.environment,
    tracesSampleRate: config.sentry.tracesSampleRate,
  })

  Sentry.addIntegration(Sentry.linkedErrorsIntegration())
}
