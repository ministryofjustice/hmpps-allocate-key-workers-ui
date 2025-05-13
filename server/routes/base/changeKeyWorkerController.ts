import { Request, Response } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import { lastNameCommaFirstName } from '../../utils/formatUtils'
import { components } from '../../@types/keyWorker'
import { FLASH_KEY__ALLOCATE_ERROR_COUNT, FLASH_KEY__ALLOCATE_SUCCESS_COUNT } from '../../utils/constants'

export class ChangeKeyWorkerController {
  constructor(readonly keyworkerApiService: KeyworkerApiService) {}

  getChangeKeyworkerData = async (req: Request, res: Response) => {
    const keyworkers = await this.keyworkerApiService.getKeyworkerMembers(req, res.locals.user.getActiveCaseloadId()!, {
      status: 'ACTIVE',
    })

    return {
      errorCount: req.flash(FLASH_KEY__ALLOCATE_ERROR_COUNT)[0],
      successCount: req.flash(FLASH_KEY__ALLOCATE_SUCCESS_COUNT)[0],
      keyworkers: keyworkers
        .sort((a, b) => (a.numberAllocated > b.numberAllocated ? 1 : -1))
        .map(o => {
          return {
            text: `${lastNameCommaFirstName(o)} (allocations: ${o.numberAllocated})`,
            value: `allocate:${o.staffId}`,
          }
        }),
    }
  }

  submitToApi = async (req: Request, res: Response): Promise<void> => {
    const apiBody: components['schemas']['PersonStaffAllocations'] = {
      allocations: [],
      deallocations: [],
    }

    const changeKeyworkers = getActionableKeyworkersFromBody(req)
    for (const prisonerKeyworker of changeKeyworkers) {
      const [prisonNumber, action, keyWorkerId] = prisonerKeyworker.split(':')
      if (action === 'deallocate') {
        apiBody.deallocations.push({
          personIdentifier: prisonNumber,
          staffId: Number(keyWorkerId),
          deallocationReason: 'MANUAL',
        })
      } else {
        apiBody.allocations.push({
          personIdentifier: prisonNumber,
          staffId: Number(keyWorkerId),
          allocationReason: 'MANUAL',
        })
      }
    }

    try {
      await this.keyworkerApiService.putAllocationDeallocations(req, res.locals.user.getActiveCaseloadId()!, apiBody)
      req.flash(FLASH_KEY__ALLOCATE_SUCCESS_COUNT, String(apiBody.allocations.length + apiBody.deallocations.length))
    } catch {
      req.flash(FLASH_KEY__ALLOCATE_ERROR_COUNT, String(apiBody.allocations.length + apiBody.deallocations.length))
    }

    res.redirect(req.get('Referrer')!)
  }
}

function getActionableKeyworkersFromBody(req: Request) {
  if (!req.body.selectKeyworker) {
    return []
  }

  if (typeof req.body.selectKeyworker === 'string') {
    return [req.body.selectKeyworker]
  }

  return req.body.selectKeyworker.filter(Boolean) || []
}
