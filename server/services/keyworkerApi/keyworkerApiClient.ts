import { Request, Response } from 'express'
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

export type KeyworkerConfigRequest = Omit<components['schemas']['StaffConfigRequest'], 'status'> & {
  status: string
}

export default class KeyworkerApiClient {
  private readonly restClient: RestClient

  constructor(req: Request, res?: Response) {
    const headers: { [key: string]: string } = {}
    if (req.middleware?.policy) {
      headers['Policy'] = req.middleware.policy
    }
    if (res?.locals?.user?.activeCaseLoad?.caseLoadId) {
      headers['CaseloadId'] = res.locals.user.activeCaseLoad.caseLoadId
    }
    this.restClient = new RestClient('Keyworker API', config.apis.keyworkerApi, req.systemClientToken, headers)
  }

  async getServiceConfigInfo(): Promise<ServiceConfigInfo> {
    return this.restClient.get<ServiceConfigInfo>({
      path: `/info`,
    })
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

  async getPrisonConfig(prisonCode: string): Promise<components['schemas']['PrisonConfigResponse']> {
    const response = await this.restClient.get<components['schemas']['PrisonConfigResponse']>({
      path: `/prisons/${prisonCode}/configurations`,
    })

    return response
  }

  async updatePrisonConfig(prisonId: string, requestBody: components['schemas']['PrisonConfigRequest']) {
    return this.restClient.put({
      path: `/prisons/${prisonId}/configurations`,
      data: requestBody,
    })
  }

  async searchStaff(
    prisonId: string,
    query: components['schemas']['StaffSearchRequest'],
  ): Promise<components['schemas']['StaffSearchResponse']['content']> {
    const response = await this.restClient.post<components['schemas']['StaffSearchResponse']>({
      path: `/search/prisons/${prisonId}/staff`,
      data: query,
    })

    return response.content
  }

  async getStaffDetails(prisonCode: string, staffId: string | number): Promise<components['schemas']['StaffDetails']> {
    return this.restClient.get<components['schemas']['StaffDetails']>({
      path: `/prisons/${prisonCode}/staff/${staffId}`,
    })
  }

  async getReferenceData(
    domain: operations['findReferenceDataForDomain']['parameters']['path']['domain'],
  ): Promise<components['schemas']['CodedDescription'][]> {
    const response = await this.restClient.get<components['schemas']['CodedDescription'][]>({
      path: `/reference-data/${domain}`,
    })

    return response
  }

  async searchPrisoners(
    prisonCode: string,
    body: components['schemas']['PersonSearchRequest'],
  ): Promise<components['schemas']['PersonSearchResponse']['content']> {
    const response = await this.restClient.post<components['schemas']['PersonSearchResponse']>({
      path: `/search/prisons/${prisonCode}/prisoners`,
      data: body,
    })

    return response.content
  }

  async getStaffAllocations(prisonerId: string): Promise<components['schemas']['StaffAllocationHistory']> {
    const response = await this.restClient.get<components['schemas']['StaffAllocationHistory']>({
      path: `/prisoners/${prisonerId}/allocations`,
    })

    return response
  }

  async putAllocationDeallocations(
    prisonCode: string,
    data: components['schemas']['PersonStaffAllocations'],
  ): Promise<components['schemas']['StaffAllocationHistory']> {
    const response = await this.restClient.put<components['schemas']['StaffAllocationHistory']>({
      path: `/prisons/${prisonCode}/prisoners/allocations`,
      data,
    })

    return response
  }

  async updateStaffConfig(prisonCode: string, staffId: string | number, requestBody: KeyworkerConfigRequest) {
    await this.restClient.put<boolean>({
      path: `/prisons/${prisonCode}/staff/${staffId}/configuration`,
      data: requestBody,
    })
  }

  async searchAllocatableStaff(prisonCode: string, query: components['schemas']['AllocatableSearchRequest']) {
    return this.restClient.post<components['schemas']['AllocatableSearchResponse']>({
      path: `/search/prisons/${prisonCode}/staff-allocations`,
      data: query,
    })
  }

  async assignRoleToStaff(
    prisonCode: string,
    staffId: number,
    query: components['schemas']['StaffJobClassificationRequest'],
  ) {
    return this.restClient.put({
      path: `/prisons/${prisonCode}/staff/${staffId}/job-classifications`,
      data: query,
    })
  }

  async allocationRecommendations(prisonCode: string) {
    return this.restClient.get<components['schemas']['RecommendedAllocations']>({
      path: `/prisons/${prisonCode}/prisoners/allocation-recommendations`,
    })
  }
}
