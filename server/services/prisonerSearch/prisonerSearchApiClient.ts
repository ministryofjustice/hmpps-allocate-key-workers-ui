import RestClient from '../../data/restClient'
import Prisoner from './prisoner'
import config from '../../config'

export interface PrisonerSearchApiClient {
  getPrisonerDetails(prisonerNumber: string): Promise<Prisoner>
}

export default class PrisonerSearchApiRestClient implements PrisonerSearchApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prison Offender Search API', config.apis.prisonerSearchApi, token)
  }

  async getPrisonerDetails(prisonerNumber: string): Promise<Prisoner> {
    return this.restClient.get<Prisoner>({ path: `/prisoner/${prisonerNumber}` })
  }
}
