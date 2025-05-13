import RestClient from '../../data/restClient'
import config from '../../config'
import type { components } from '../../@types/keyWorker'

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
  ): Promise<components['schemas']['PrisonStats']> {
    const response = await this.restClient.get<components['schemas']['PrisonStats']>({
      path: `/prisons/${prisonId}/statistics/keyworker?from=${fromDate}&to=${toDate}`,
    })

    return response
  }

  async getPrisonConfig(prisonCode: string): Promise<components['schemas']['PrisonKeyworkerConfiguration']> {
    const response = await this.restClient.get<components['schemas']['PrisonKeyworkerConfiguration']>({
      path: `/prisons/${prisonCode}/configuration/keyworker`,
    })

    return response
  }

  async getKeyworkerMembers(
    prisonId: string,
    query: components['schemas']['KeyworkerSearchRequest'],
  ): Promise<components['schemas']['KeyworkerSummary'][]> {
    const response = await this.restClient.post<{ content: components['schemas']['KeyworkerSummary'][] }>({
      path: `/search/prisons/${prisonId}/keyworkers`,
      data: query,
    })

    return response.content
  }

  async getKeyworkerDetails(prisonCode: string, staffId: string): Promise<components['schemas']['KeyworkerDetails']> {
    const response = await this.restClient.get<components['schemas']['KeyworkerDetails']>({
      path: `/prisons/${prisonCode}/keyworkers/${staffId}`,
    })

    return response
  }

  async getKeyworkerStatuses(): Promise<components['schemas']['CodedDescription'][]> {
    const response = await this.restClient.get<components['schemas']['CodedDescription'][]>({
      path: '/reference-data/keyworker-status',
    })

    return response
  }

  async searchPrisoners(
    prisonCode: string,
    body: components['schemas']['PersonSearchRequest'],
  ): Promise<components['schemas']['PersonSearchResponse']['content']> {
    const response = await this.restClient.post<components['schemas']['PersonSearchResponse']>({
      path: `/search/prisons/${prisonCode}/prisoners`,
      data: {
        ...body,
      },
    })

    return response.content
  }

  async getKeyworkerAllocations(prisonerId: string): Promise<components['schemas']['PersonStaffAllocationHistory']> {
    const response = await this.restClient.get<components['schemas']['PersonStaffAllocationHistory']>({
      path: `/prisoners/${prisonerId}/keyworkers`,
    })

    return response
  }

  async putAllocationDeallocations(
    prisonCode: string,
    data: components['schemas']['PersonStaffAllocations'],
  ): Promise<components['schemas']['PersonStaffAllocationHistory']> {
    const response = await this.restClient.put<components['schemas']['PersonStaffAllocationHistory']>({
      path: `/prisons/${prisonCode}/prisoners/keyworkers`,
      data,
    })

    return response
  }
}
