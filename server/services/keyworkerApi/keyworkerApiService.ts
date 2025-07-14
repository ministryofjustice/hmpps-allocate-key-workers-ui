import { Request, Response } from 'express'
import { EnhancedRestClientBuilder } from '../../data'
import KeyworkerApiClient, { ServiceConfigInfo, StaffDetailsRequest } from './keyworkerApiClient'
import { components } from '../../@types/keyWorker'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'

export default class KeyworkerApiService {
  constructor(private readonly keyworkerApiClientBuilder: EnhancedRestClientBuilder<KeyworkerApiClient>) {}

  getServiceConfigInfo(req: Request): Promise<ServiceConfigInfo> {
    return this.keyworkerApiClientBuilder(req).getServiceConfigInfo()
  }

  getPrisonStats(
    req: Request,
    prisonId: string,
    fromDate: string,
    toDate: string,
  ): ReturnType<KeyworkerApiClient['getPrisonStats']> {
    return this.keyworkerApiClientBuilder(req).getPrisonStats(prisonId, fromDate, toDate)
  }

  getPrisonConfig(req: Request, prisonId: string): ReturnType<KeyworkerApiClient['getPrisonConfig']> {
    return this.keyworkerApiClientBuilder(req).getPrisonConfig(prisonId)
  }

  updatePrisonConfig(
    req: Request,
    res: Response,
    allowAutoAllocation: boolean,
    maximumCapacity: number,
    frequencyInWeeks?: number,
  ) {
    const config = req.middleware!.prisonConfiguration!

    const requestBody = {
      isEnabled: res.locals.user.permissions >= UserPermissionLevel.ADMIN || config.isEnabled,
      hasPrisonersWithHighComplexityNeeds: config.hasPrisonersWithHighComplexityNeeds,
      allowAutoAllocation,
      capacity: maximumCapacity,
      frequencyInWeeks: frequencyInWeeks ?? config.frequencyInWeeks,
    }

    return this.keyworkerApiClientBuilder(req, res).updatePrisonConfig(
      res.locals.user.getActiveCaseloadId()!,
      requestBody,
    )
  }

  async getStaffDetails(
    req: Request,
    prisonCode: string,
    staffId: string | number,
    includeStats: boolean,
  ): Promise<components['schemas']['StaffDetails'] & { staff: { firstName: string; lastName: string } }> {
    const response = await this.keyworkerApiClientBuilder(req).getStaffDetails(prisonCode, staffId, includeStats)

    return { ...response, staff: { firstName: response.firstName, lastName: response.lastName } }
  }

  getReferenceData(
    req: Request,
    domain: 'staff-status' | 'allocation-reason' | 'deallocation-reason',
  ): ReturnType<KeyworkerApiClient['getReferenceData']> {
    return this.keyworkerApiClientBuilder(req).getReferenceData(domain)
  }

  searchPrisoners(
    req: Request,
    prisonCode: string,
    body: components['schemas']['PersonSearchRequest'],
  ): ReturnType<KeyworkerApiClient['searchPrisoners']> {
    return this.keyworkerApiClientBuilder(req).searchPrisoners(prisonCode, body)
  }

  getStaffAllocations(req: Request, prisonerId: string): ReturnType<KeyworkerApiClient['getStaffAllocations']> {
    return this.keyworkerApiClientBuilder(req).getStaffAllocations(prisonerId)
  }

  putAllocationDeallocations(
    req: Request,
    res: Response,
    prisonCode: string,
    data: components['schemas']['PersonStaffAllocations'],
  ): ReturnType<KeyworkerApiClient['putAllocationDeallocations']> {
    return this.keyworkerApiClientBuilder(req, res).putAllocationDeallocations(prisonCode, data)
  }

  searchAllocatableStaff(
    req: Request,
    res: Response,
    searchOptions: components['schemas']['AllocatableSearchRequest'],
    includeStats: boolean,
  ) {
    return this.keyworkerApiClientBuilder(req, res).searchAllocatableStaff(
      res.locals.user.getActiveCaseloadId()!,
      searchOptions,
      includeStats,
    )
  }

  upsertStaffDetails(req: Request, res: Response, staffId: string | number, requestBody: StaffDetailsRequest) {
    return this.keyworkerApiClientBuilder(req, res).upsertStaffDetails(
      res.locals.user.getActiveCaseloadId()!,
      staffId,
      requestBody,
    )
  }

  allocationRecommendations(req: Request, prisonCode: string) {
    return this.keyworkerApiClientBuilder(req).allocationRecommendations(prisonCode)
  }

  searchStaff(req: Request, prisonCode: string, query: components['schemas']['StaffSearchRequest']) {
    return this.keyworkerApiClientBuilder(req).searchStaff(prisonCode, query)
  }
}
