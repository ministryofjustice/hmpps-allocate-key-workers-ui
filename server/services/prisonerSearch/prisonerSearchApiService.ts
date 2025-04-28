import { Request } from 'express'
import { RestClientBuilder } from '../../data'
import { PrisonerSearchApiClient } from './prisonerSearchApiClient'
import Prisoner from './prisoner'

export default class PrisonerSearchApiService {
  constructor(private readonly prisonerSearchClientBuilder: RestClientBuilder<PrisonerSearchApiClient>) {}

  getPrisonerDetails(req: Request, prisonerNumber: string): Promise<Prisoner> {
    return this.prisonerSearchClientBuilder(req.systemClientToken).getPrisonerDetails(prisonerNumber)
  }
}
