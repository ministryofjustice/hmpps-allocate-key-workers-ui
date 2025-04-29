import { Request } from 'express'
import { RestClientBuilder } from '../../data'
import LocationsInsidePrisonApiRestClient from './locationsInsidePrisonApiClient'

export default class LocationsInsidePrisonApiService {
  constructor(
    private readonly locationsInsidePrisonApiClientBuilder: RestClientBuilder<LocationsInsidePrisonApiRestClient>,
  ) {}

  getResidentialLocations(
    req: Request,
    prisonId: string,
  ): ReturnType<LocationsInsidePrisonApiRestClient['getResidentialLocations']> {
    return this.locationsInsidePrisonApiClientBuilder(req.systemClientToken).getResidentialLocations(prisonId)
  }
}
