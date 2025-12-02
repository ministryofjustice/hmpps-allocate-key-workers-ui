import * as Sentry from '@sentry/node'
import config from './config'

if (config.sentry.dsn) {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.sentry.environment,
    tracesSampleRate: config.sentry.tracesSampleRate,
    skipOpenTelemetrySetup: true,
    integrations: [Sentry.httpIntegration({ spans: false })],
  })
}
