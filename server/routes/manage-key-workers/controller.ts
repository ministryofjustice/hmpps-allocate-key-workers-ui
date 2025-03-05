import { Request, Response } from "express";
import KeyworkerApiService from "../../services/keyworkerApi/keyworkerApiService";
import { components } from "../../@types/keyWorker";

export class ManageKeyWorkersController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) { }

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { activeCaseLoad } = user

    if (!activeCaseLoad) {
      throw new Error("No active caseload")
    }

    // TEMP CODE WHILE API GETS FIXED
    if (req.query.status === 'ALL') {
      req.query.status = 'ACTIVE'
    }

    const data = await this.keyworkerApiService.getKeyworkerMembers(req, activeCaseLoad!.caseLoadId, { query: req.query.query, status: req.query.status || 'ACTIVE' })

    const { page, clear, sort, query, status } = req.query

    res.render("manage-key-workers/view", {
      sort: sort,
      showBreadcrumbs: true,
      records: sortRecords(data.content.filter(o => status === 'All' || !status || o.status.description === status), sort as string),
      status: [
        { value: 'ALL', text: 'All' },
        { value: 'ACTIVE', text: 'Active' },
        { value: 'UNAVAILABLE_ANNUAL_LEAVE', text: 'Unavailable (annual leave)' },
        { value: 'UNAVAILABLE_LONG_TERM_ABSENCE', text: 'Unavailable (long-term absence)' },
        { value: 'UNAVAILABLE_NO_PRISONER_CONTACT', text: 'Unavailable (no prisoner contact)' },
        { value: 'INACTIVE', text: 'Inactive' }
      ]
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const query = new URLSearchParams({ query: req.body.query, status: req.body.status })
    res.redirect(`manage-key-workers?${query.toString()}`)
  }
}

function sortRecords(records: components['schemas']['KeyworkerSummary'][], sort: string) {
  const [sortingKey, sortingDirection] = sort.split(',')

  return records.sort((a, b) => {
    if (sortingKey === 'name') {
      return `${a.lastName}, ${a.firstName}`.localeCompare(`${b.lastName}, ${b.firstName}`) * ((sortingDirection === 'asc') ? 1 : -1)
    }
    if (sortingKey === 'status') {
      return a.status.description.localeCompare(b.status.description) * ((sortingDirection === 'asc') ? 1 : -1)
    }
    //@ts-ignore
    return (a[sortingKey] - b[sortingKey]) * ((sortingDirection === 'asc') ? 1 : -1)
  })
}