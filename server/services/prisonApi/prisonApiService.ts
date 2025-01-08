import { Request } from 'express'
import { Readable } from 'stream'
import { RestClientBuilder } from '../../data'
import { PrisonApiClient } from './prisonApiClient'
import { CaseLoad } from '../../interfaces/caseLoad'

export default class PrisonApiService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  getPrisonerImage(req: Request, prisonerNumber: string): Promise<Readable> {
    return this.prisonApiClientBuilder(req.systemClientToken).getPrisonerImage(prisonerNumber)
  }

  getCaseLoads(req: Request): Promise<CaseLoad[]> {
    return this.prisonApiClientBuilder(req.systemClientToken).getUserCaseLoads()
  }
}
