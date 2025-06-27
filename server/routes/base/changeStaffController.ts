import { Request, Response, NextFunction } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import { lastNameCommaFirstName } from '../../utils/formatUtils'
import { components } from '../../@types/keyWorker'
import { FLASH_KEY__COUNT, FLASH_KEY__API_ERROR } from '../../utils/constants'
import { SelectKeyworkerSchemaType } from './selectKeyworkerSchema'

export class ChangeStaffController {
  constructor(readonly keyworkerApiService: KeyworkerApiService) {}

  getChangeStaffData = async (req: Request, res: Response) => {
    const staff = await this.keyworkerApiService.searchAllocatableStaff(req, res, { status: 'ACTIVE' })

    return {
      count: req.flash(FLASH_KEY__COUNT)[0],
      apiError: req.flash(FLASH_KEY__API_ERROR)[0],
      staff: staff.content
        .sort((a, b) => (a.allocated > b.allocated ? 1 : -1))
        .map(o => {
          return {
            text: `${lastNameCommaFirstName(o)} (allocations: ${o.allocated})`,
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

    for (const prisonerKeyworker of req.body.selectStaffMember.filter(Boolean)) {
      const [prisonNumber, action, staffId, isAuto] = prisonerKeyworker.split(':')
      if (action === 'deallocate') {
        apiBody.deallocations.push({
          personIdentifier: prisonNumber!,
          staffId: Number(staffId),
          deallocationReason: 'MANUAL',
        })
      } else {
        apiBody.allocations.push({
          personIdentifier: prisonNumber!,
          staffId: Number(staffId),
          allocationReason: isAuto ? 'AUTO' : 'MANUAL',
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
