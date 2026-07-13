import { initialiseTelemetry, flushTelemetry, telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import { RequestHandler } from 'express'
import logger from '../../logger'

if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  initialiseTelemetry({
    serviceName: 'hmpps-allocate-key-workers-ui',
    serviceVersion: process.env['BUILD_NUMBER'] || 'unknown',
    connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
    debug: process.env['DEBUG_TELEMETRY'] === 'true',
  })
    .addFilter(telemetry.processors.filterSpanWherePath(['/health', '/ping', '/info', '/assets/*', '/favicon.ico']))
    .addModifier(telemetry.processors.enrichSpanNameWithHttpRoute())
    .startRecording()

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down...`)
    await flushTelemetry()
    process.exit(0)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

export default function addUsernameAndCaseloadToTelemetry(): RequestHandler {
  return (_req, res, next) => {
    const { username } = res?.locals?.user || {}
    const activeCaseloadId = res?.locals?.user.getActiveCaseloadId()
    telemetry.setSpanAttributes({
      ...(username && { username }),
      ...(activeCaseloadId && { activeCaseloadId }),
    })
    return next()
  }
}
