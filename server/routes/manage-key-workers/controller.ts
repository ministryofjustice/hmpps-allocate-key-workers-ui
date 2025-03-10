import { Request, Response } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import KeyworkerApiClient from '../../services/keyworkerApi/keyworkerApiClient'

export class ManageKeyWorkersController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { activeCaseLoad } = user

    if (!activeCaseLoad) {
      throw new Error('No active caseload')
    }

    const statuses = [
      { value: 'ALL', text: 'All' },
      { value: 'ACTIVE', text: 'Active' },
      { value: 'UNAVAILABLE_ANNUAL_LEAVE', text: 'Unavailable (annual leave)' },
      { value: 'UNAVAILABLE_LONG_TERM_ABSENCE', text: 'Unavailable (long-term absence)' },
      { value: 'UNAVAILABLE_NO_PRISONER_CONTACT', text: 'Unavailable (no prisoner contact)' },
      { value: 'INACTIVE', text: 'Inactive' },
    ]

    const { query, status } = req.query || {}

    const data = await this.keyworkerApiService.getKeyworkerMembers(req, activeCaseLoad!.caseLoadId, {
      query,
      status: status || 'ALL',
    } as Parameters<KeyworkerApiClient['getKeyworkerMembers']>[1])

    res.render('manage-key-workers/view', {
      params: req.query,
      showBreadcrumbs: true,
      records: data,
      status: statuses.map(o => ({ ...o, selected: o.value === status })),
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const queryParams = new URLSearchParams({ query: req.body.query, status: req.body.status })
    res.redirect(`manage-key-workers?${queryParams.toString()}`)
  }
}
