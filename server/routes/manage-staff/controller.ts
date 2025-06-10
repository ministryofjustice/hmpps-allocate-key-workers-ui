import { Request, Response } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import { sanitizeQueryName, sanitizeSelectValue } from '../../middleware/validationMiddleware'
import { components } from '../../@types/keyWorker'

export class ManageStaffController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { activeCaseLoad } = user

    if (!activeCaseLoad) {
      throw new Error('No active caseload')
    }

    const keyworkerStatuses = await this.keyworkerApiService.getReferenceData(req, 'staff-status')
    const statuses = keyworkerStatuses.map(keyworkerStatus => {
      return { value: keyworkerStatus.code, text: keyworkerStatus.description }
    })

    const query = {
      query: sanitizeQueryName(req.query['query']?.toString() || ''),
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

    const data = await this.keyworkerApiService.searchStaff(req, res, searchOptions)

    res.render('manage-staff/view', {
      params: query,
      showBreadcrumbs: true,
      records: data.content,
      status: statuses.map(o => ({ ...o, selected: o.value === query.status })),
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const queryParams = new URLSearchParams({ query: req.body.query, status: req.body.status })
    res.redirect(`manage-staff?${queryParams.toString()}`)
  }
}
