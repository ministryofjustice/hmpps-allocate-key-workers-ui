import { Request, Response, NextFunction } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import { FLASH_KEY__SUCCESS_MESSAGE } from '../../utils/constants'
import { AdminViewSchemaType, NonAdminViewSchemaType, parseFrequencyInWeeks } from './schema'

export class EstablishmentSettingsController {
  constructor(
    private readonly keyworkerApiService: KeyworkerApiService,
    private readonly isAdmin: boolean,
  ) {}

  GET = async (req: Request, res: Response) => {
    const { allowAutoAllocate, capacityTier1, capacityTier2, kwSessionFrequencyInWeeks } =
      res.locals.prisonConfiguration

    res.render('establishment-settings/view', {
      prisonName: res.locals.user.activeCaseLoad!.description,
      allowAutoAllocation:
        res.locals.formResponses?.['allowAutoAllocation'] === undefined
          ? allowAutoAllocate
          : res.locals.formResponses?.['allowAutoAllocation'] === 'TRUE',
      maximumCapacity: res.locals.formResponses?.['maximumCapacity'] ?? capacityTier2 ?? capacityTier1,
      frequencyInWeeks:
        res.locals.formResponses?.['frequencyInWeeks'] === undefined
          ? kwSessionFrequencyInWeeks
          : parseFrequencyInWeeks(res.locals.formResponses?.['frequencyInWeeks']),
      isAdmin: this.isAdmin,
      successMessage: req.flash(FLASH_KEY__SUCCESS_MESSAGE)[0],
    })
  }

  submitToApi = async (
    req: Request<unknown, unknown, AdminViewSchemaType | NonAdminViewSchemaType>,
    res: Response,
    next: NextFunction,
  ) => {
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
