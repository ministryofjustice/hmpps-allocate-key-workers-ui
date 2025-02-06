import { Request } from 'express'
import { RestClientBuilder } from '../../data'
import KeyworkerApiClient, { ServiceConfigInfo } from './keyworkerApiClient'

export default class KeyworkerApiService {
  constructor(private readonly keyworkerApiClientBuilder: RestClientBuilder<KeyworkerApiClient>) {}

  getServiceConfigInfo(req: Request): Promise<ServiceConfigInfo> {
    return this.keyworkerApiClientBuilder(req.systemClientToken).getServiceConfigInfo()
  }

  isKeyworker(req: Request, prisonCode: string, username: string): ReturnType<KeyworkerApiClient['isKeyworker']> {
    return this.keyworkerApiClientBuilder(req.systemClientToken).isKeyworker(prisonCode, username)
  }

  getPrisonStats(
    req: Request,
    prisonId: string,
    fromDate: string,
    toDate: string,
  ): ReturnType<KeyworkerApiClient['getPrisonStats']> {
    return this.keyworkerApiClientBuilder(req.systemClientToken).getPrisonStats(prisonId, fromDate, toDate)
  }

  getPrisonMigrationStatus(req: Request, prisonId: string): ReturnType<KeyworkerApiClient['getPrisonMigrationStatus']> {
    return this.keyworkerApiClientBuilder(req.systemClientToken).getPrisonMigrationStatus(prisonId)
  }
}
