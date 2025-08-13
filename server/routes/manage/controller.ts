import { Request, Response } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import { sanitizeQueryName, sanitizeSelectValue } from '../../middleware/validationMiddleware'
import { components } from '../../@types/keyWorker'
import { getHistoryParam } from '../../middleware/historyMiddleware'

export class ManageController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { activeCaseLoad } = user

    const searchTerm = sanitizeQueryName(req.query['query']?.toString() || '')

    if (searchTerm) res.setAuditDetails.searchTerm(searchTerm)

    if (!activeCaseLoad) {
      throw new Error('No active caseload')
    }

    const keyworkerStatuses = await this.keyworkerApiService.getReferenceData(req, 'staff-status')
    const statuses = keyworkerStatuses.map(keyworkerStatus => {
      return { value: keyworkerStatus.code, text: keyworkerStatus.description }
    })

    const query = {
      query: searchTerm,
      status: sanitizeSelectValue(
        keyworkerStatuses.map(o => o.code),
        req.query['status']?.toString() || 'ALL',
        'ALL',
      ),
    }

    const searchOptions = {
      query: query.query,
      status: query.status as components['schemas']['StaffSearchRequest']['status'],
      hasPolicyStaffRole: true,
    }

    const data = await this.keyworkerApiService.searchAllocatableStaff(req, res, searchOptions, true)

    res.render('manage/view', {
      params: query,
      showBreadcrumbs: true,
      records: data.content,
      status: statuses.map(o => ({ ...o, selected: o.value === query.status })),
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const queryParams = new URLSearchParams({
      query: req.body.query,
      status: req.body.status,
      history: getHistoryParam(req),
    })
    res.redirect(`manage?${queryParams.toString()}`)
  }
}
