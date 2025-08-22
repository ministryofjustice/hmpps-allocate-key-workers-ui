import { Request, Response } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import LocationsInsidePrisonApiService from '../../services/locationsInsidePrisonApi/locationsInsidePrisonApiService'
import { ChangeStaffController } from '../base/changeStaffController'
import { schemaFactory } from './schema'
import { FLASH_KEY__ALLOCATE_RESULT } from '../../utils/constants'
import { deduplicateFieldErrors } from '../../middleware/validationMiddleware'
import { getHistoryParamForPOST } from '../../middleware/historyMiddleware'

export class AllocateStaffController extends ChangeStaffController {
  constructor(
    keyworkerApiService: KeyworkerApiService,
    private readonly locationsApiService: LocationsInsidePrisonApiService,
  ) {
    super(keyworkerApiService)
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

    const { allowAutoAllocation } = req.middleware!.prisonConfiguration!
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
        jsEnabled: req.query['js'] === 'true',
      })
    }

    const records = await this.keyworkerApiService.searchPrisoners(req, prisonCode, sanitisedQuery)
    return res.render('allocate/view', {
      ...sanitisedQuery,
      records,
      searchQuery,
      locations: locationsValues,
      ...(await this.getChangeData(req, res)),
      showBreadcrumbs: true,
      allowAutoAllocation,
      allocationResult,
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
    params.set('history', getHistoryParamForPOST(req, `/${res.locals.policyPath}/allocate`, params))
    params.set('js', req.body.js === 'true' ? 'true' : 'false')
    return res.redirect(`/${res.locals.policyPath}/allocate?${params.toString()}`)
  }
}
