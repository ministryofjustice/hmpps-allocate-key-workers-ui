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
    const prisonCode = res.locals.user.activeCaseLoad!.caseLoadId!
    const records = await this.keyworkerApiService.searchPrisoners(req, prisonCode, {
      query: req.query['query']?.toString() || '',
      cellLocationPrefix: req.query['location']?.toString() || '',
    })

    const keyworkers = await this.keyworkerApiService.getKeyworkerMembers(req, prisonCode, { status: 'ACTIVE' })
    const locations = await this.locationsApiService.getResidentialLocations(req, prisonCode)

    const withoutKeyworker = req.query['withoutKeyworker'] === 'true'
    res.render('allocate-key-workers/view', {
      query: req.query['query'],
      location: req.query['location'],
      withoutKeyworker,
      records: records.filter(o => withoutKeyworker || o.keyworker),
      locations: locations.map(o => o.fullLocationPath),
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
      withoutKeyworker: req.body.withoutKeyworker || false,
    })
    return res.redirect(`/allocate-key-workers?${params.toString()}`)
  }
}
