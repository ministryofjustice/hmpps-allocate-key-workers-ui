import superagent, { type SuperAgentRequest, type Response } from 'superagent'

const url = 'http://localhost:9091/__admin'

const stubFor = (mapping: Record<string, unknown>): SuperAgentRequest =>
  superagent.post(`${url}/mappings`).send(mapping)

const getMatchingRequests = (body: string | object | undefined) => superagent.post(`${url}/requests/find`).send(body)

const getLastAPICallMatching = async (matching: string | object): Promise<unknown> => {
  const wiremockApiResponse: Response = await superagent.post(`${url}/requests/find`).send(matching)
  const responses = (wiremockApiResponse.body || '[]').requests
  const last = responses[responses.length - 1]
  return last?.body && JSON.parse(last.body)
}

const parseAuditEventBody = (itm: { body?: string }) => {
  if (!itm.body || !itm.body.includes('MessageBody')) {
    return undefined
  }
  const eventJson = JSON.parse(JSON.parse(itm.body)['MessageBody'])
  delete eventJson['correlationId']
  delete eventJson['when']
  return eventJson
}

const getSentAuditEvents = async (): Promise<unknown> => {
  const wiremockApiResponse: Response = await superagent
    .post(`${url}/requests/find`)
    .send({ method: 'POST', urlPath: '/' })
  // Skip first two audit events that come from sign-in
  const responses = (wiremockApiResponse.body || '[]').requests.slice(2)
  return responses.map(parseAuditEventBody)
}

const resetStubs = (): Promise<Array<Response>> =>
  Promise.all([superagent.delete(`${url}/mappings`), superagent.delete(`${url}/requests`)])

export { stubFor, getMatchingRequests, getSentAuditEvents, resetStubs, getLastAPICallMatching }
