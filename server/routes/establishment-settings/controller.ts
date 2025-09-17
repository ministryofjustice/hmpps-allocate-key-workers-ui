import { NextFunction, Request, Response } from 'express'
import AllocationsApiService from '../../services/allocationsApi/allocationsApiService'
import { FLASH_KEY__SUCCESS_MESSAGE } from '../../utils/constants'
import { parseFrequencyInWeeks, SchemaType } from './schema'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'

export class EstablishmentSettingsController {
  constructor(private readonly allocationsApiService: AllocationsApiService) {}

  GET = async (req: Request, res: Response) => {
    const { allowAutoAllocation, capacity, frequencyInWeeks, allocationOrder } = req.middleware!.prisonConfiguration!

    const policyStatus = await this.allocationsApiService.getPolicies(req, res.locals.user.getActiveCaseloadId()!)

    res.render('establishment-settings/view', {
      showBreadcrumbs: true,
      prisonName: res.locals.user.activeCaseLoad!.description,
      allowAutoAllocation:
        res.locals.formResponses?.['allowAutoAllocation'] === undefined
          ? allowAutoAllocation
          : res.locals.formResponses?.['allowAutoAllocation'] === 'TRUE',
      maximumCapacity: res.locals.formResponses?.['maximumCapacity'] ?? capacity,
      frequencyInWeeks:
        res.locals.formResponses?.['frequencyInWeeks'] === undefined
          ? frequencyInWeeks
          : parseFrequencyInWeeks(res.locals.formResponses?.['frequencyInWeeks']),
      isAdmin: res.locals.user.permissions >= UserPermissionLevel.ADMIN,
      successMessage: req.flash(FLASH_KEY__SUCCESS_MESSAGE)[0],
      keyWorkerEnabled: policyStatus.policies.find(({ enabled, policy }) => enabled && policy === 'KEY_WORKER'),
      personalOfficerEnabled: policyStatus.policies.find(
        ({ enabled, policy }) => enabled && policy === 'PERSONAL_OFFICER',
      ),
      allocationOrder:
        res.locals.formResponses?.['allocationOrder'] === undefined
          ? allocationOrder
          : res.locals.formResponses?.['allocationOrder'],
    })
  }

  submitToApi = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const { allowAutoAllocation, maximumCapacity, frequencyInWeeks, allocationOrder } = req.body

    try {
      await this.allocationsApiService.updatePrisonConfig(
        req as Request,
        res,
        allowAutoAllocation,
        maximumCapacity,
        frequencyInWeeks,
        allocationOrder,
      )
      req.flash(FLASH_KEY__SUCCESS_MESSAGE, 'Establishment settings updated')
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = (req: Request, res: Response) => res.redirect(req.get('Referrer') || '/')
}
