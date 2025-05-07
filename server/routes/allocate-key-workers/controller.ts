import { Request, Response } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import { lastNameCommaFirstName } from '../../utils/formatUtils'
import LocationsInsidePrisonApiService from '../../services/locationsInsidePrisonApi/locationsInsidePrisonApiService'

export class AllocateKeyWorkerController {
  constructor(
    private readonly keyworkerApiService: KeyworkerApiService,
    private readonly locationsApiService: LocationsInsidePrisonApiService,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const prisonCode = res.locals.user.getActiveCaseloadId()!
    const records = await this.keyworkerApiService.searchPrisoners(req, prisonCode, {
      query: req.query['query']?.toString() || '',
      cellLocationPrefix: req.query['location']?.toString() || '',
      excludeActiveAllocations: req.query['excludeActiveAllocations'] === 'true',
    })

    const keyworkers = await this.keyworkerApiService.getKeyworkerMembers(req, prisonCode, { status: 'ACTIVE' })
    const locations = await this.locationsApiService.getResidentialLocations(req, prisonCode)

    const excludeActiveAllocations = req.query['excludeActiveAllocations'] === 'true'
    const searchParams = new URLSearchParams(req.query as Record<string, string>).toString()

    res.render('allocate-key-workers/view', {
      searchQuery: searchParams.length > 0 ? `?${searchParams}` : '',
      query: req.query['query'],
      location: req.query['location'],
      excludeActiveAllocations,
      records,
      locations: locations.map(o => ({ text: o.localName || o.fullLocationPath, value: o.fullLocationPath })),
      keyworkers: keyworkers
        .sort((a, b) => (a.numberAllocated > b.numberAllocated ? 1 : -1))
        .map(o => {
          return {
            text: `${lastNameCommaFirstName(o)} (allocations: ${o.numberAllocated})`,
            value: o.staffId,
          }
        }),
      showBreadcrumbs: true,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const params = new URLSearchParams({
      query: req.body.query || '',
      location: req.body.location || '',
      excludeActiveAllocations: req.body.excludeActiveAllocations || false,
    })
    return res.redirect(`/allocate-key-workers?${params.toString()}`)
  }
}
