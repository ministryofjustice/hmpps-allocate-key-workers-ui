import RestClient from '../../data/restClient'
import config from '../../config'
import { components } from '../../@types/locationsInsidePrison'

export default class LocationsInsidePrisonApiRestClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Locations inside Prison API', config.apis.locationsInsidePrisonApi, token)
  }

  async getResidentialLocations(prisonId: string): Promise<components['schemas']['PrisonHierarchyDto'][]> {
    return this.restClient.get({ path: `/locations/prison/${prisonId}/residential-hierarchy`, query: { maxLevel: 1 } })
  }
}
