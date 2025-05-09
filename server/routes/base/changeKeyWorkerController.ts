import { Request, Response } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import { lastNameCommaFirstName } from '../../utils/formatUtils'
import { components } from '../../@types/keyWorker'

export class ChangeKeyWorkerController {
  constructor(readonly keyworkerApiService: KeyworkerApiService) {}

  getChangeKeyworkerData = async (req: Request, res: Response) => {
    const keyworkers = await this.keyworkerApiService.getKeyworkerMembers(req, res.locals.user.getActiveCaseloadId()!, {
      status: 'ACTIVE',
    })

    return {
      errorCount: req.flash('errorCount')[0],
      successCount: req.flash('successCount')[0],
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

  POST = async (req: Request, res: Response): Promise<void> => {
    const apiBody: components['schemas']['PersonStaffAllocations'] = {
      allocations: [],
      deallocations: [],
    }

    for (const prisonerKeyworker of req.body.selectKeyworker.filter(Boolean)) {
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
      req.flash('successCount', String(apiBody.allocations.length + apiBody.deallocations.length))
    } catch (e) {
      console.error(e)
      req.flash('errorCount', String(apiBody.allocations.length + apiBody.deallocations.length))
    }

    res.redirect(req.get('Referrer')!)
  }
}
