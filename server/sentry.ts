import * as Sentry from '@sentry/node'
import config from './config'

if (config.sentry.dsn) {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.sentry.environment,
    sampleRate: 1, // Error sample rate
    tracesSampleRate: 0,
    profileSessionSampleRate: 0,
    profilesSampleRate: 0,
    skipOpenTelemetrySetup: true,
    openTelemetryInstrumentations: [],
    openTelemetrySpanProcessors: [],
  })
}
