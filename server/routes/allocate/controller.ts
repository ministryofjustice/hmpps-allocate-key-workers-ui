import { Request, Response } from 'express'
import AllocationsApiService from '../../services/allocationsApi/allocationsApiService'
import LocationsInsidePrisonApiService from '../../services/locationsInsidePrisonApi/locationsInsidePrisonApiService'
import { ChangeStaffController } from '../base/changeStaffController'
import { schemaFactory } from './schema'
import { FLASH_KEY__ALLOCATE_RESULT } from '../../utils/constants'
import { deduplicateFieldErrors } from '../../middleware/validationMiddleware'
import { prisonerProfileBacklink } from '../../utils/utils'

export class AllocateStaffController extends ChangeStaffController {
  constructor(
    allocationsApiService: AllocationsApiService,
    private readonly locationsApiService: LocationsInsidePrisonApiService,
  ) {
    super(allocationsApiService)
  }

  GET = async (req: Request, res: Response): Promise<void> => {
    const sanitisedQuery = {
      query: req.query['query']?.toString() || '',
      cellLocationPrefix: req.query['cellLocationPrefix']?.toString() || '',
      excludeActiveAllocations: req.query['excludeActiveAllocations']?.toString() === 'true',
    }

    if (sanitisedQuery.query) {
      res.setAuditDetails.searchTerm(sanitisedQuery.query)
    }

    const { allowAutoAllocation, allocationOrder } = req.middleware!.prisonConfiguration!
    const prisonCode = res.locals.user.getActiveCaseloadId()!
    const locations = await this.locationsApiService.getResidentialLocations(req, prisonCode)
    const locationsValues = locations.map(o => ({ text: o.localName || o.fullLocationPath, value: o.fullLocationPath }))

    let allocationResult = req.flash(FLASH_KEY__ALLOCATE_RESULT)[0]
    allocationResult = allocationResult && JSON.parse(allocationResult)

    const searchQuery = new URLSearchParams(
      Object.entries(sanitisedQuery).reduce((acc, [key, value]) => ({ ...acc, [key]: String(value) }), {}),
    ).toString()

    if (!Object.keys(req.query).filter(o => o !== 'history' && o !== 'js').length) {
      return res.render('allocate/view', {
        locations: locationsValues,
        showBreadcrumbs: true,
        allowAutoAllocation,
        allocationResult,
        allocationOrder,
        jsEnabled: req.query['js'] === 'true',
      })
    }

    const result = schemaFactory(locations).safeParse(sanitisedQuery)
    if (!result.success) {
      res.locals['validationErrors'] = deduplicateFieldErrors(result.error)
      return res.render('allocate/view', {
        ...sanitisedQuery,
        locations: locationsValues,
        showBreadcrumbs: true,
        allowAutoAllocation,
        allocationResult,
        allocationOrder,
        jsEnabled: req.query['js'] === 'true',
      })
    }

    const records = await this.allocationsApiService.searchPrisoners(req, prisonCode, sanitisedQuery)
    return res.render('allocate/view', {
      ...sanitisedQuery,
      records: records.map(o => {
        return {
          ...o,
          profileHref: prisonerProfileBacklink(req, res, o.personIdentifier),
          alertsHref: prisonerProfileBacklink(req, res, o.personIdentifier, '/alerts/active'),
        }
      }),
      searchQuery,
      locations: locationsValues,
      ...(await this.getChangeData(req, res)),
      showBreadcrumbs: true,
      allowAutoAllocation,
      allocationResult,
      allocationOrder,
      jsEnabled: req.query['js'] === 'true',
    })
  }

  POST = async (req: Request, res: Response) => res.redirect(req.get('Referrer')!)

  filter = async (req: Request, res: Response): Promise<void> => {
    const params = new URLSearchParams({
      query: req.body.query || '',
      cellLocationPrefix: req.body.cellLocationPrefix || '',
      excludeActiveAllocations: req.body.excludeActiveAllocations || false,
    })
    params.set('js', req.body.js === 'true' ? 'true' : 'false')
    return res.redirect(`/${res.locals.policyPath}/allocate?${params.toString()}`)
  }
}
