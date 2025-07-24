import { Request, Response } from 'express'
import { EnhancedRestClientBuilder } from '../../data'
import KeyworkerApiClient, { ServiceConfigInfo, StaffDetailsRequest } from './keyworkerApiClient'
import { components } from '../../@types/keyWorker'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'
import CacheInterface from '../../data/cache/cacheInterface'

export default class KeyworkerApiService {
  private prisonConfigCache: CacheInterface<components['schemas']['PrisonConfigResponse']>

  private readonly PRISON_CONFIG_CACHE_TIMEOUT = Number(process.env['PRISON_CONFIG_CACHE_TIMEOUT'] ?? 60)

  constructor(
    private readonly keyworkerApiClientBuilder: EnhancedRestClientBuilder<KeyworkerApiClient>,
    cacheStore: (prefix: string) => CacheInterface<components['schemas']['PrisonConfigResponse']>,
  ) {
    this.prisonConfigCache = cacheStore('prison-config')
  }

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

  async getPrisonConfig(req: Request, prisonId: string): Promise<ReturnType<KeyworkerApiClient['getPrisonConfig']>> {
    const cached = await this.prisonConfigCache.get(prisonId)
    if (cached) {
      return cached
    }
    const prisonConfig = await this.keyworkerApiClientBuilder(req).getPrisonConfig(prisonId)

    await this.prisonConfigCache.set(prisonId, prisonConfig, this.PRISON_CONFIG_CACHE_TIMEOUT)

    return prisonConfig
  }

  async updatePrisonConfig(
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

    const result = await this.keyworkerApiClientBuilder(req, res).updatePrisonConfig(
      res.locals.user.getActiveCaseloadId()!,
      requestBody,
    )

    await this.prisonConfigCache.del(res.locals.user.getActiveCaseloadId()!)

    return result
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
    const query = {
      excludeActiveAllocations: body.excludeActiveAllocations,
    } as components['schemas']['PersonSearchRequest']

    if (body.query) {
      query.query = body.query
    }

    if (body.cellLocationPrefix) {
      query.cellLocationPrefix = body.cellLocationPrefix.replace(/([^-])$/, '$1-')
    }

    return this.keyworkerApiClientBuilder(req).searchPrisoners(prisonCode, query)
  }

  getStaffAllocations(
    req: Request,
    prisonerId: string,
    policy?: string,
  ): ReturnType<KeyworkerApiClient['getStaffAllocations']> {
    return this.keyworkerApiClientBuilder(req).getStaffAllocations(prisonerId, policy)
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
