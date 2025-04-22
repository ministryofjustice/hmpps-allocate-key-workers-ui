import { Request, Response } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import { firstNameSpaceLastName } from '../../utils/formatUtils'
import LocationsInsidePrisonApiService from '../../services/locationsInsidePrisonApi/locationsInsidePrisonApiService'
import { getNonUndefinedProp } from '../../utils/utils'

export class AllocateKeyWorkerController {
  constructor(
    private readonly keyworkerApiService: KeyworkerApiService,
    private readonly locationsApiService: LocationsInsidePrisonApiService,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const prisonCode = res.locals.user.activeCaseLoad!.caseLoadId!
    const records = await this.keyworkerApiService.searchPrisoners(req, prisonCode, {
      ...getNonUndefinedProp(req.query, 'query'),
      ...getNonUndefinedProp(req.query, 'location'),
    })

    const keyworkers = await this.keyworkerApiService.getKeyworkerMembers(req, prisonCode, { status: 'ALL' })
    const locations = await this.locationsApiService.getResidentialLocations(req, prisonCode)

    res.render('allocate-key-workers/view', {
      query: req.query['query'],
      location: req.query['location'],
      withoutKeyworker: req.query['withoutKeyworker'] === 'true',
      records: records.filter(o => req.query['withoutKeyworker'] === 'true' || o.keyworker),
      locations,
      keyworkers: keyworkers.map(o => {
        return {
          text: `${firstNameSpaceLastName(o)} (allocations: ${o.numberAllocated})`,
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
