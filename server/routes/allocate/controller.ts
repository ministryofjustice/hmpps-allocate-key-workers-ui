import { Request, Response } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import LocationsInsidePrisonApiService from '../../services/locationsInsidePrisonApi/locationsInsidePrisonApiService'
import { deduplicateFieldErrors, sanitizeQueryName, sanitizeSelectValue } from '../../middleware/validationMiddleware'
import { ChangeStaffController } from '../base/changeStaffController'
import { schema } from './schema'
import { FLASH_KEY__ALLOCATE_RESULT } from '../../utils/constants'

export class AllocateStaffController extends ChangeStaffController {
  constructor(
    keyworkerApiService: KeyworkerApiService,
    private readonly locationsApiService: LocationsInsidePrisonApiService,
  ) {
    super(keyworkerApiService)
  }

  GET = async (req: Request, res: Response): Promise<void> => {
    const { allowAutoAllocation } = req.middleware!.prisonConfiguration!
    const prisonCode = res.locals.user.getActiveCaseloadId()!
    const locations = await this.locationsApiService.getResidentialLocations(req, prisonCode)
    const locationsValues = locations.map(o => ({ text: o.localName || o.fullLocationPath, value: o.fullLocationPath }))

    const sanitisedQuery = {
      query: sanitizeQueryName(req.query['query']?.toString() || ''),
      cellLocationPrefix: sanitizeSelectValue(
        locations.map(o => o.fullLocationPath),
        req.query['cellLocationPrefix']?.toString() || '',
      ),
      excludeActiveAllocations: req.query['excludeActiveAllocations']?.toString() === 'true',
    }

    let allocationResult = req.flash(FLASH_KEY__ALLOCATE_RESULT)[0]
    allocationResult = allocationResult && JSON.parse(allocationResult)

    if (!Object.keys(req.query).length) {
      return res.render('allocate/view', {
        locations: locationsValues,
        showBreadcrumbs: true,
        allowAutoAllocation,
        allocationResult,
      })
    }

    const result = schema.safeParse(sanitisedQuery)
    if (!result.success) {
      res.locals['validationErrors'] = deduplicateFieldErrors(result.error)
      return res.render('allocate/view', {
        locations: locationsValues,
        showBreadcrumbs: true,
        allowAutoAllocation,
        allocationResult,
      })
    }

    const records = await this.keyworkerApiService.searchPrisoners(req, prisonCode, sanitisedQuery)

    return res.render('allocate/view', {
      searchQuery: `?${new URLSearchParams(Object.entries(sanitisedQuery).reduce((acc, [key, value]) => ({ ...acc, [key]: String(value) }), {}))}`,
      ...sanitisedQuery,
      records,
      locations: locationsValues,
      ...(await this.getChangeData(req, res)),
      showBreadcrumbs: true,
      allowAutoAllocation,
      allocationResult,
    })
  }

  POST = async (req: Request, res: Response) => res.redirect(req.get('Referrer')!)

  filter = async (req: Request, res: Response): Promise<void> => {
    const params = new URLSearchParams({
      query: req.body.query || '',
      cellLocationPrefix: req.body.cellLocationPrefix || '',
      excludeActiveAllocations: req.body.excludeActiveAllocations || false,
    })
    return res.redirect(`/${res.locals.policyPath}/allocate?${params.toString()}`)
  }
}
