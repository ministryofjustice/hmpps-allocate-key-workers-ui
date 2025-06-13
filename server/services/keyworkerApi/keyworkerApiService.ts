import { Request, Response } from 'express'
import { EnhancedRestClientBuilder } from '../../data'
import KeyworkerApiClient, { KeyworkerConfigRequest, ServiceConfigInfo } from './keyworkerApiClient'
import { components } from '../../@types/keyWorker'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'
import { todayString } from '../../utils/datetimeUtils'

export default class KeyworkerApiService {
  constructor(private readonly keyworkerApiClientBuilder: EnhancedRestClientBuilder<KeyworkerApiClient>) {}

  getServiceConfigInfo(req: Request): Promise<ServiceConfigInfo> {
    return this.keyworkerApiClientBuilder(req).getServiceConfigInfo()
  }

  isKeyworker(req: Request, prisonCode: string, username: string): ReturnType<KeyworkerApiClient['isKeyworker']> {
    return this.keyworkerApiClientBuilder(req).isKeyworker(prisonCode, username)
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

    return this.keyworkerApiClientBuilder(req).updatePrisonConfig(res.locals.user.getActiveCaseloadId()!, requestBody)
  }

  getKeyworkerMembers(
    req: Request,
    prisonId: string,
    query: Parameters<KeyworkerApiClient['getKeyworkerMembers']>[1],
  ): ReturnType<KeyworkerApiClient['getKeyworkerMembers']> {
    return this.keyworkerApiClientBuilder(req).getKeyworkerMembers(prisonId, query)
  }

  getKeyworkerDetails(
    req: Request,
    prisonCode: string,
    staffId: string | number,
  ): ReturnType<KeyworkerApiClient['getKeyworkerDetails']> {
    return this.keyworkerApiClientBuilder(req).getKeyworkerDetails(prisonCode, staffId)
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

  getKeyworkerAllocations(req: Request, prisonerId: string): ReturnType<KeyworkerApiClient['getKeyworkerAllocations']> {
    return this.keyworkerApiClientBuilder(req).getKeyworkerAllocations(prisonerId)
  }

  putAllocationDeallocations(
    req: Request,
    res: Response,
    prisonCode: string,
    data: components['schemas']['PersonStaffAllocations'],
  ): ReturnType<KeyworkerApiClient['putAllocationDeallocations']> {
    return this.keyworkerApiClientBuilder(req, res).putAllocationDeallocations(prisonCode, data)
  }

  updateKeyworkerProperties(
    req: Request,
    res: Response,
    prisonCode: string,
    staffId: string | number,
    requestBody: KeyworkerConfigRequest,
  ): ReturnType<KeyworkerApiClient['updateKeyworkerProperties']> {
    return this.keyworkerApiClientBuilder(req, res).updateKeyworkerProperties(prisonCode, staffId, requestBody)
  }

  searchStaff(req: Request, res: Response, searchOptions: components['schemas']['StaffSearchRequest']) {
    return this.keyworkerApiClientBuilder(req, res).searchStaff(res.locals.user.getActiveCaseloadId()!, searchOptions)
  }

  assignRoleToStaff(
    req: Request,
    res: Response,
    staffId: number,
    positionCode: string,
    scheduleCode: string,
    hoursPerWeek: number,
  ) {
    return this.keyworkerApiClientBuilder(req, res).assignRoleToStaff(res.locals.user.getActiveCaseloadId()!, staffId, {
      position: positionCode,
      scheduleType: scheduleCode,
      hoursPerWeek,
      fromDate: todayString(),
    })
  }

  allocationRecommendations(req: Request, prisonCode: string) {
    return this.keyworkerApiClientBuilder(req).allocationRecommendations(prisonCode)
  }
}
