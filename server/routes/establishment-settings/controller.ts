import { Request, Response, NextFunction } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import { FLASH_KEY__SUCCESS_MESSAGE } from '../../utils/constants'
import { SchemaType, parseFrequencyInWeeks } from './schema'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'

export class EstablishmentSettingsController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response) => {
    const { allowAutoAllocation, capacity, maximumCapacity, frequencyInWeeks } = req.middleware!.prisonConfiguration!

    res.render('establishment-settings/view', {
      showBreadcrumbs: true,
      prisonName: res.locals.user.activeCaseLoad!.description,
      allowAutoAllocation:
        res.locals.formResponses?.['allowAutoAllocation'] === undefined
          ? allowAutoAllocation
          : res.locals.formResponses?.['allowAutoAllocation'] === 'TRUE',
      maximumCapacity: res.locals.formResponses?.['maximumCapacity'] ?? maximumCapacity ?? capacity,
      frequencyInWeeks:
        res.locals.formResponses?.['frequencyInWeeks'] === undefined
          ? frequencyInWeeks
          : parseFrequencyInWeeks(res.locals.formResponses?.['frequencyInWeeks']),
      isAdmin: res.locals.user.permissions >= UserPermissionLevel.ADMIN,
      successMessage: req.flash(FLASH_KEY__SUCCESS_MESSAGE)[0],
    })
  }

  submitToApi = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const { allowAutoAllocation, maximumCapacity, frequencyInWeeks } = req.body

    try {
      await this.keyworkerApiService.updatePrisonConfig(
        req as Request,
        res,
        allowAutoAllocation,
        maximumCapacity,
        frequencyInWeeks,
      )
      req.flash(FLASH_KEY__SUCCESS_MESSAGE, 'Establishment settings updated')
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = (req: Request, res: Response) => res.redirect(req.get('Referrer') || '/')
}
