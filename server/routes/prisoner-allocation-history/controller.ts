import { Request, Response } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import { components } from '../../@types/keyWorker'
import { POLICIES } from '../../utils/constants'
import { getLastDifferentPageNotMatching } from '../../middleware/historyMiddleware'

export class PrisonerAllocationHistoryController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const prisoner = req.middleware!.prisonerData!
    const policy = sanitisePolicy(res, req.url.split('/').pop()?.split('?')[0])
    const staffAllocations = await this.keyworkerApiService.getStaffAllocations(req, prisoner.prisonerNumber, policy)

    res.render('prisoner-allocation-history/view', {
      prisoner,
      tabPolicy: policy,
      allocationHistory: simplifyDeallocationReasons(staffAllocations.allocations),
      backUrl: getLastDifferentPageNotMatching(
        req,
        new RegExp(`/prisoner-allocation-history/${prisoner.prisonerNumber}`),
      ),
    })
  }
}

const sanitisePolicy = (res: Response, policy?: string) => {
  return res.locals['policyPath'] === 'personal-officer' && Object.keys(POLICIES).includes(policy || '')
    ? policy
    : res.locals['policyPath']
}

const manualDeallocation = {
  code: 'MANUAL',
  description: 'Manual',
}

const automaticDeallocation = {
  code: 'AUTOMATIC',
  description: 'Automatic',
}

const deallocationReasonMap = new Map([
  ['OVERRIDE', manualDeallocation],
  ['MISSING', automaticDeallocation],
  ['DUPLICATE', automaticDeallocation],
  ['MERGED', automaticDeallocation],
])

function simplifyDeallocationReasons(allocations: components['schemas']['StaffAllocation'][]) {
  return allocations.map(allocation => {
    const deReason = allocation.deallocated?.reason

    if (deReason) {
      return {
        ...allocation,
        deallocated: {
          ...allocation.deallocated,
          reason: deallocationReasonMap.get(deReason.code) || deReason,
        },
      }
    }

    return allocation
  })
}
