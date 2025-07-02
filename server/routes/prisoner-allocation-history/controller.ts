import { Request, Response } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import { components } from '../../@types/keyWorker'

export class PrisonerAllocationHistoryController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const prisoner = req.middleware!.prisonerData!
    const staffAllocations = await this.keyworkerApiService.getStaffAllocations(req, prisoner.prisonerNumber)

    const searchParams = new URLSearchParams(req.query as Record<string, string>).toString()

    res.render('prisoner-allocation-history/view', {
      prisoner,
      allocationHistory: simplifyDeallocationReasons(staffAllocations.allocations),
      backUrl: `/${res.locals.policyPath}/allocate${searchParams.length > 0 ? `?${searchParams}` : ''}`,
    })
  }
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
