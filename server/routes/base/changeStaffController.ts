import { Request, Response, NextFunction } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import { lastNameCommaFirstName } from '../../utils/formatUtils'
import { components } from '../../@types/keyWorker'
import { FLASH_KEY__COUNT, FLASH_KEY__API_ERROR } from '../../utils/constants'
import { SelectKeyworkerSchemaType } from './selectKeyworkerSchema'

export class ChangeStaffController {
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

  submitToApi = async (
    req: Request<unknown, unknown, SelectKeyworkerSchemaType>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const apiBody: components['schemas']['PersonStaffAllocations'] = {
      allocations: [],
      deallocations: [],
    }

    for (const prisonerKeyworker of req.body.selectKeyworker.filter(Boolean)) {
      const [prisonNumber, action, keyWorkerId] = prisonerKeyworker.split(':')
      if (action === 'deallocate') {
        apiBody.deallocations.push({
          personIdentifier: prisonNumber!,
          staffId: Number(keyWorkerId),
          deallocationReason: 'MANUAL',
        })
      } else {
        apiBody.allocations.push({
          personIdentifier: prisonNumber!,
          staffId: Number(keyWorkerId),
          allocationReason: 'MANUAL',
        })
      }
    }

    await this.keyworkerApiService.putAllocationDeallocations(
      req as Request,
      res,
      res.locals.user.getActiveCaseloadId()!,
      apiBody,
    )

    req.flash(FLASH_KEY__COUNT, String(apiBody.allocations.length + apiBody.deallocations.length))

    next()
  }
}
