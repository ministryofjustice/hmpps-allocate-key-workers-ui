import { Request, Response } from 'express'
import { Response as SuperAgentResponse } from 'superagent'
import AuditedRestClient from '../../data/auditedRestClient'
import config from '../../config'
import type { components, operations } from '../../@types/keyWorker'
import { MakeNullable } from '../../utils/utils'

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

export type StaffDetailsRequest = MakeNullable<
  components['schemas']['StaffDetailsRequest'],
  'reactivateOn' | 'staffRole'
>

export default class AllocationsApiClient {
  private readonly restClient: AuditedRestClient

  constructor(req: Request, res?: Response) {
    const headers: { [key: string]: string } = {}
    if (req.middleware?.policy) {
      headers['Policy'] = req.middleware.policy
    }
    if (res?.locals?.user?.activeCaseLoad?.caseLoadId) {
      headers['CaseloadId'] = res.locals.user.activeCaseLoad.caseLoadId
    }
    this.restClient = new AuditedRestClient(
      'Keyworker API',
      config.apis.keyworkerApi,
      req.systemClientToken,
      headers,
      (err, response: SuperAgentResponse) => {
        if (err) return true
        if (response?.statusCode) {
          return response.statusCode >= 500
        }
        return undefined
      },
      res,
    )
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
    comparisonFrom: string,
    comparisonTo: string,
  ): Promise<components['schemas']['PrisonStats']> {
    return this.restClient.get<components['schemas']['PrisonStats']>({
      path: `/prisons/${prisonId}/statistics?from=${fromDate}&to=${toDate}&comparisonFrom=${comparisonFrom}&comparisonTo=${comparisonTo}`,
    })
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
      retry: true,
    })
  }

  async searchStaff(
    prisonId: string,
    query: components['schemas']['StaffSearchRequest'],
  ): Promise<components['schemas']['StaffSearchResponse']['content']> {
    const response = await this.restClient.post<components['schemas']['StaffSearchResponse']>(
      {
        path: `/search/prisons/${prisonId}/staff`,
        data: query,
        retry: true,
      },
      true,
    )

    return response.content
  }

  async getStaffDetails(
    prisonCode: string,
    staffId: string | number,
    includeStats: boolean,
    dateRange?: { from: string; to: string; comparisonFrom: string; comparisonTo: string },
  ): Promise<components['schemas']['StaffDetails']> {
    const dateRangeQuery = dateRange
      ? `&to=${dateRange.to}&from=${dateRange.from}&comparisonTo=${dateRange.comparisonTo}&comparisonFrom=${dateRange.comparisonFrom}`
      : ''

    return this.restClient.get<components['schemas']['StaffDetails']>({
      path: `/prisons/${prisonCode}/staff/${staffId}?includeStats=${includeStats}${dateRangeQuery}`,
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
    const response = await this.restClient.post<components['schemas']['PersonSearchResponse']>(
      {
        path: `/search/prisons/${prisonCode}/prisoners`,
        data: body,
        retry: true,
      },
      true,
    )

    return response.content
  }

  async getStaffAllocations(
    prisonerId: string,
    policy?: string,
  ): Promise<components['schemas']['StaffAllocationHistory']> {
    const response = await this.restClient.get<components['schemas']['StaffAllocationHistory']>({
      path: `/prisoners/${prisonerId}/allocations`,
      ...(policy ? { headers: { Policy: policy } } : {}),
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
      retry: true,
    })

    return response
  }

  async searchAllocatableStaff(
    prisonCode: string,
    query: components['schemas']['AllocatableSearchRequest'],
    includeStats: boolean,
  ) {
    return this.restClient.post<components['schemas']['AllocatableSearchResponse']>(
      {
        path: `/search/prisons/${prisonCode}/staff-allocations?includeStats=${includeStats}`,
        data: query,
        retry: true,
      },
      true,
    )
  }

  async upsertStaffDetails(prisonCode: string, staffId: string | number, requestBody: StaffDetailsRequest) {
    await this.restClient.put({
      path: `/prisons/${prisonCode}/staff/${staffId}`,
      data: requestBody,
      retry: true,
    })
  }

  async allocationRecommendations(prisonCode: string) {
    return this.restClient.get<components['schemas']['RecommendedAllocations']>({
      path: `/prisons/${prisonCode}/prisoners/allocation-recommendations`,
    })
  }

  async getPolicies(prisonCode: string) {
    return this.restClient.get<components['schemas']['PrisonPolicies']>({
      path: `/prisons/${prisonCode}/policies`,
    })
  }

  async putPolicies(prisonCode: string, requestBody: components['schemas']['PrisonPolicies']) {
    return this.restClient.put<components['schemas']['PrisonPolicies']>({
      path: `/prisons/${prisonCode}/policies`,
      data: requestBody,
      retry: true,
    })
  }

  async searchRecordedEvents(prisonCode: string, staffId: string, data: components['schemas']['RecordedEventRequest']) {
    const response = await this.restClient.post<components['schemas']['RecordedEventResponse']>(
      {
        path: `/search/prisons/${prisonCode}/staff/${staffId}/recorded-events`,
        data,
        retry: true,
      },
      true,
    )

    return response.recordedEvents
  }
}
