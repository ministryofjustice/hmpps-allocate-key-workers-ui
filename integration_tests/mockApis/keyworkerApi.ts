import { stubFor } from './wiremock'

const stubKeyworkerApiHealth = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/keyworker-api/health/ping',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: 'UP' },
    },
  })

const stubKeyworkerApiStatusIsKeyworker = (isKeyworker: boolean) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/keyworker-api/prisons/LEI/key-workers/USER1/status',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { isKeyworker },
    },
  })

export default {
  stubKeyworkerApiHealth,
  stubKeyworkerApiStatusIsKeyworker: () => stubKeyworkerApiStatusIsKeyworker(true),
  stubKeyworkerApiStatusIsNotKeyworker: () => stubKeyworkerApiStatusIsKeyworker(false),
}
