import RestClient from '../../data/restClient'
import config from '../../config'
import type { components, operations } from '../../@types/keyWorker'

export interface ServiceConfigInfo {
  git: {
    branch: string
    commit: {
      id: string
      time: string
    }
  }
  build: {
    operatingSystem: string
    version: string
    artifact: string
    machine: string
    by: string
    name: string
    time: string
    group: string
  }
  activeAgencies: string[]
  publishEvents: boolean
  productId: string
}
export default class KeyworkerApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Keyworker API', config.apis.keyworkerApi, token)
  }

  async getServiceConfigInfo(): Promise<ServiceConfigInfo> {
    return this.restClient.get<ServiceConfigInfo>({
      path: `/info`,
    })
  }

  async isKeyworker(prisonCode: string, username: string): Promise<boolean> {
    const response = await this.restClient.get<components['schemas']['UsernameKeyworker']>({
      path: `/prisons/${prisonCode}/key-workers/${username}/status`,
    })

    return response.isKeyworker
  }

  async getPrisonStats(
    prisonId: string,
    fromDate: string,
    toDate: string,
  ): Promise<components['schemas']['PrisonStatsDto']> {
    const response = await this.restClient.get<components['schemas']['PrisonStatsDto']>({
      path: `/prisons/${prisonId}/keyworker/statistics?from=${fromDate}&to=${toDate}`,
    })

    return response
  }

  async getPrisonMigrationStatus(prisonId: string): Promise<components['schemas']['Prison']> {
    const response = await this.restClient.get<components['schemas']['Prison']>({
      path: `/key-worker/prison/${prisonId}`,
    })

    return response
  }

  async getKeyworkerMembers(prisonId: string, query: components['schemas']['KeyworkerSearchRequest']): Promise<components['schemas']['KeyworkerSummary'][]> {
    const response = await this.restClient.post<{content: components['schemas']['KeyworkerSummary'][]}>({
      path: `/search/prisons/${prisonId}/keyworkers`,
      data: query
    })

    return response.content
  }
}
