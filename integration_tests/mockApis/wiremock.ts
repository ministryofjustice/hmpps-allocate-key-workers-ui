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

const resetStubs = (): Promise<Array<Response>> =>
  Promise.all([superagent.delete(`${url}/mappings`), superagent.delete(`${url}/requests`)])

export { stubFor, getMatchingRequests, resetStubs, getLastAPICallMatching }
