import { Request, Response, NextFunction } from 'express'
import AllocationsApiService from '../../services/allocationsApi/allocationsApiService'
import { lastNameCommaFirstName } from '../../utils/formatUtils'
import { components } from '../../@types/keyWorker'
import {
  FLASH_KEY__COUNT,
  FLASH_KEY__API_ERROR,
  FLASH_KEY__ALLOCATE_RESULT,
  AllocateResultType,
  AllocateResult,
} from '../../utils/constants'
import { SelectKeyworkerSchemaType } from './selectKeyworkerSchema'

type CaseNoteSorter = (
  a: { createdAt: string; occurredAt: string },
  b: { createdAt: string; occurredAt: string },
) => number

export class ChangeStaffController {
  constructor(readonly allocationsApiService: AllocationsApiService) {}

  getChangeData = async (req: Request, res: Response) => {
    const staff = await this.allocationsApiService.searchAllocatableStaff(req, res, { status: 'ACTIVE' }, false)
    const mappedStaff = this.getDropdownOptions(staff.content)

    return {
      count: req.flash(FLASH_KEY__COUNT)[0],
      apiError: req.flash(FLASH_KEY__API_ERROR)[0],
      staff: mappedStaff,
    }
  }

  getDropdownOptions = <T extends { allocated: number; staffId: number; firstName: string; lastName: string }>(
    staff: T[],
  ) => {
    return staff
      .sort((a, b) =>
        a.allocated === b.allocated
          ? `${a.lastName},${a.firstName}`.localeCompare(`${b.lastName},${b.firstName}`)
          : a.allocated - b.allocated,
      )
      .map(o => {
        return {
          text: `${lastNameCommaFirstName(o)} (allocations: ${o.allocated})`,
          value: `allocate:${o.staffId}`,
        } as { text: string; value: string; onlyFor?: string }
      })
  }

  submitToApi =
    (allocateOnly: boolean) =>
    async (
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

      await this.allocationsApiService.putAllocationDeallocations(
        req as Request,
        res,
        res.locals.user.getActiveCaseloadId()!,
        apiBody,
      )

      if (allocateOnly) {
        req.flash(
          FLASH_KEY__ALLOCATE_RESULT,
          JSON.stringify({
            type: AllocateResultType.SUCCESS,
            count: apiBody.allocations.length,
            staffCount: new Set(apiBody.allocations.map(itm => itm.staffId)).size,
          } as AllocateResult),
        )
      } else {
        req.flash(FLASH_KEY__COUNT, String(apiBody.allocations.length + apiBody.deallocations.length))
      }

      next()
    }

  getCaseNoteSorter = (sort?: string): CaseNoteSorter => {
    switch (sort) {
      case 'createdAt,DESC':
        return (a, b) => -a.createdAt.localeCompare(b.createdAt)
      case 'createdAt,ASC':
        return (a, b) => a.createdAt.localeCompare(b.createdAt)
      case 'occurredAt,ASC':
        return (a, b) => a.occurredAt.localeCompare(b.occurredAt)
      case 'occurredAt,DESC':
      default:
        return (a, b) => -a.occurredAt.localeCompare(b.occurredAt)
    }
  }
}
