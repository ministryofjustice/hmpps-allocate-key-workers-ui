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

  getPrisonConfig(req: Request, prisonId: string): ReturnType<KeyworkerApiClient['getPrisonConfig']> {
    return this.keyworkerApiClientBuilder(req.systemClientToken).getPrisonConfig(prisonId)
  }

  getKeyworkerMembers(
    req: Request,
    prisonId: string,
    query: Parameters<KeyworkerApiClient['getKeyworkerMembers']>[1],
  ): ReturnType<KeyworkerApiClient['getKeyworkerMembers']> {
    return this.keyworkerApiClientBuilder(req.systemClientToken).getKeyworkerMembers(prisonId, query)
  }

  getKeyworkerDetails(
    req: Request,
    prisonCode: string,
    staffId: string,
  ): ReturnType<KeyworkerApiClient['getKeyworkerDetails']> {
    return this.keyworkerApiClientBuilder(req.systemClientToken).getKeyworkerDetails(prisonCode, staffId)
  }

  getKeyworkerStatuses(req: Request): ReturnType<KeyworkerApiClient['getKeyworkerStatuses']> {
    return this.keyworkerApiClientBuilder(req.systemClientToken).getKeyworkerStatuses()
  }

  searchPrisoners(
    req: Request,
    prisonCode: string,
    body: { query?: string; location?: string } = {},
  ): ReturnType<KeyworkerApiClient['searchPrisoners']> {
    return this.keyworkerApiClientBuilder(req.systemClientToken).searchPrisoners(prisonCode, body)
  }
}
