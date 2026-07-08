import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'

export const telemetryWrapper = () => {
  if (!process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    return undefined
  }

  return {
    trackEvent: (event: { name: string; properties?: { [p: string]: unknown } }) => {
      const props: { [p: string]: string | number | boolean } = {}
      if (event.properties) {
        Object.entries(event.properties).forEach(([key, val]) => {
          if (['string', 'number', 'boolean'].includes(typeof val)) {
            props[key] = val as string | number | boolean
          }
        })
      }
      telemetry.trackEvent(event.name, props)
    },
  }
}
