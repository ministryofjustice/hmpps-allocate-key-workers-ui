import { Readable } from 'stream'
import RestClient from '../../data/restClient'
import config from '../../config'
import { CaseLoad } from '../../interfaces/caseLoad'

export interface PrisonApiClient {
  getPrisonerImage(prisonerNumber: string): Promise<Readable>

  getUserCaseLoads(): Promise<CaseLoad[]>
}

export default class PrisonApiRestClient implements PrisonApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prison API', config.apis.prisonApi, token)
  }

  async getPrisonerImage(prisonerNumber: string): Promise<Readable> {
    return this.restClient.stream({
      path: `/api/bookings/offenderNo/${prisonerNumber}/image/data`,
    })
  }

  async getUserCaseLoads(): Promise<CaseLoad[]> {
    return this.restClient.get<CaseLoad[]>({ path: '/api/users/me/caseLoads' })
  }
}
