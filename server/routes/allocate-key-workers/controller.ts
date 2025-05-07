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

    const keyworkers = await this.keyworkerApiService.getKeyworkerMembers(req, prisonCode, { status: 'ACTIVE' })
    const locations = await this.locationsApiService.getResidentialLocations(req, prisonCode)

    const query = {
      query: sanitizeQuery(req.query['query']?.toString() || ''),
      cellLocationPrefix: sanitizeLocation(
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

    res.render('allocate-key-workers/view', {
      searchQuery: query.query || query.cellLocationPrefix || query.excludeActiveAllocations ? `?${searchParams}` : '',
      query: query.query,
      cellLocationPrefix: query.cellLocationPrefix,
      excludeActiveAllocations: query.excludeActiveAllocations,
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
      cellLocationPrefix: req.body.cellLocationPrefix || '',
      excludeActiveAllocations: req.body.excludeActiveAllocations || false,
    })
    return res.redirect(`/allocate-key-workers?${params.toString()}`)
  }
}

function sanitizeQuery(query: string): string {
  if (query.match(/^[\p{L} .',0-9’-]+$/u)) {
    return query
  }

  return ''
}

function sanitizeLocation(locations: string[], location: string): string {
  if (locations.includes(location)) {
    return location
  }

  return ''
}
