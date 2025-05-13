import { Request, Response } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import { lastNameCommaFirstName } from '../../utils/formatUtils'
import { components } from '../../@types/keyWorker'
import { FLASH_KEY__COUNT, FLASH_KEY__API_ERROR, FLASH_KEY__VALIDATION_ERRORS } from '../../utils/constants'

export class ChangeKeyWorkerController {
  constructor(readonly keyworkerApiService: KeyworkerApiService) {}

  getChangeKeyworkerData = async (req: Request, res: Response) => {
    const keyworkers = await this.keyworkerApiService.getKeyworkerMembers(req, res.locals.user.getActiveCaseloadId()!, {
      status: 'ACTIVE',
    })

    return {
      count: req.flash(FLASH_KEY__COUNT)[0],
      apiError: req.flash(FLASH_KEY__API_ERROR)[0],
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

    if (apiBody.allocations.length + apiBody.deallocations.length === 0) {
      req.flash(
        FLASH_KEY__VALIDATION_ERRORS,
        JSON.stringify({ selectKeyworker: ['At least one allocation or deallocation must be made'] }),
      )
      return res.redirect(req.get('Referrer')!)
    }

    req.flash(FLASH_KEY__COUNT, String(apiBody.allocations.length + apiBody.deallocations.length))

    try {
      await this.keyworkerApiService.putAllocationDeallocations(req, res.locals.user.getActiveCaseloadId()!, apiBody)
    } catch {
      req.flash(FLASH_KEY__API_ERROR, 'ALLOCATE_FAILED')
    }

    return res.redirect(req.get('Referrer')!)
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
