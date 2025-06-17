import { Request, Response } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import LocationsInsidePrisonApiService from '../../services/locationsInsidePrisonApi/locationsInsidePrisonApiService'
import { sanitizeQueryName, sanitizeSelectValue } from '../../middleware/validationMiddleware'
import { ChangeStaffController } from '../base/changeStaffController'

export class AllocateStaffController extends ChangeStaffController {
  constructor(
    keyworkerApiService: KeyworkerApiService,
    private readonly locationsApiService: LocationsInsidePrisonApiService,
  ) {
    super(keyworkerApiService)
  }

  GET = async (req: Request, res: Response): Promise<void> => {
    const prisonCode = res.locals.user.getActiveCaseloadId()!
    const locations = await this.locationsApiService.getResidentialLocations(req, prisonCode)

    const query = {
      query: sanitizeQueryName(req.query['query']?.toString() || ''),
      cellLocationPrefix: sanitizeSelectValue(
        locations.map(o => o.fullLocationPath),
        req.query['cellLocationPrefix']?.toString() || '',
      ),
      excludeActiveAllocations: req.query['excludeActiveAllocations'] === 'true',
    }

    const records = await this.keyworkerApiService.searchPrisoners(req, prisonCode, query)

    const searchParams = new URLSearchParams({
      ...query,
      excludeActiveAllocations: String(query.excludeActiveAllocations),
    }).toString()

    res.render('allocate/view', {
      searchQuery: query.query || query.cellLocationPrefix || query.excludeActiveAllocations ? `?${searchParams}` : '',
      query: query.query,
      cellLocationPrefix: query.cellLocationPrefix,
      excludeActiveAllocations: query.excludeActiveAllocations,
      records,
      locations: locations.map(o => ({ text: o.localName || o.fullLocationPath, value: o.fullLocationPath })),
      ...(await this.getChangeStaffData(req, res)),
      showBreadcrumbs: true,
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
