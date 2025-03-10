import { Request, Response } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import { components } from '../../@types/keyWorker'
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

    if (req.query['clear']) {
      delete req.session.filter
    }

    const { query, status } = req.query || {}
    const sort = req.query['sort'] || 'name'
    const direction = req.query['direction'] || 'asc'

    const data = await this.keyworkerApiService.getKeyworkerMembers(req, activeCaseLoad!.caseLoadId, {
      query,
      status: status || 'ALL',
    } as Parameters<KeyworkerApiClient['getKeyworkerMembers']>[1])

    res.render('manage-key-workers/view', {
      params: req.query,
      showBreadcrumbs: true,
      records: sortRecords(data, sort as string, direction as 'asc' | 'desc'),
      status: statuses.map(o => ({ ...o, selected: o.value === status })),
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    req.session.filter = { query: req.body.query, status: req.body.status }
    const queryParams = new URLSearchParams({ query: req.body.query, status: req.body.status })
    res.redirect(`manage-key-workers?${queryParams.toString()}`)
  }
}

function sortRecords(records: components['schemas']['KeyworkerSummary'][], sort = '', direction = '') {
  if (!sort.length) {
    return records
  }

  const sortingKey = sort as keyof components['schemas']['KeyworkerSummary'] | 'name'
  const sortingDirection = direction as 'asc' | 'desc'

  return records.sort((a, b) => {
    if (!sortingKey) return 0
    const sortMultiplier = sortingDirection === 'asc' ? 1 : -1

    if (sortingKey === 'name') {
      return `${a.lastName}, ${a.firstName}`.localeCompare(`${b.lastName}, ${b.firstName}`) * sortMultiplier
    }

    if (sortingKey === 'status') {
      return a.status.description.localeCompare(b.status.description) * sortMultiplier
    }

    if (typeof a[sortingKey] === 'number') {
      return ((a[sortingKey] as number) - (b[sortingKey] as number)) * sortMultiplier
    }

    return String(a[sortingKey]).localeCompare(String(b[sortingKey])) * sortMultiplier
  })
}
