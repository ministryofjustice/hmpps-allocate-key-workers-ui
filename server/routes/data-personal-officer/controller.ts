import { Request, Response } from 'express'
import { format, startOfMonth, subDays, endOfMonth } from 'date-fns'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'
import { formatDateConcise } from '../../utils/datetimeUtils'
import { ResQuerySchemaType } from './schema'
import { getEstablishmentData } from '../data/utils'

export class POStaffDataController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  private getDateAsIsoString = () => {
    const lastDay = subDays(new Date(), 1)
    const firstDay = startOfMonth(lastDay)
    return { dateFrom: format(firstDay, 'yyyy-MM-dd'), dateTo: format(lastDay, 'yyyy-MM-dd') }
  }

  private addComparisonDates = ({
    dateFrom,
    dateTo,
    compareDateFrom,
    compareDateTo,
  }: {
    dateFrom: string
    dateTo: string
    compareDateFrom?: string
    compareDateTo?: string
  }) => {
    if (compareDateFrom && compareDateTo) return { dateFrom, dateTo, compareDateFrom, compareDateTo }

    const previousMonth = new Date(dateFrom)
    previousMonth.setMonth(previousMonth.getMonth() - 1)

    return {
      dateFrom,
      dateTo,
      compareDateFrom: format(startOfMonth(previousMonth), 'yyyy-MM-dd'),
      compareDateTo: format(endOfMonth(previousMonth), 'yyyy-MM-dd'),
    }
  }

  GET = async (req: Request, res: Response) => {
    const resQuery = res.locals['query'] as ResQuerySchemaType
    const dateRange = this.addComparisonDates(resQuery?.validated ?? this.getDateAsIsoString())
    const prisonCode = res.locals.user.getActiveCaseloadId()!
    const stats = await this.keyworkerApiService.getPrisonStats(
      req,
      prisonCode,
      dateRange.dateFrom,
      dateRange.dateTo,
      dateRange.compareDateFrom,
      dateRange.compareDateTo,
    )

    res.render('data-personal-officer/view', {
      showBreadcrumbs: true,
      stats,
      data: getEstablishmentData(stats, req),
      dateFrom: resQuery?.dateFrom ?? formatDateConcise(stats.current?.from),
      dateTo: resQuery?.dateTo ?? formatDateConcise(stats.current?.to),
      compareDateFrom: resQuery?.compareDateFrom,
      compareDateTo: resQuery?.compareDateTo,
      dateUpdated: new Date().toISOString(),
    })
  }

  POST = async (req: Request, res: Response) => {
    res.redirect(
      `data?dateFrom=${req.body.dateFrom ?? ''}&dateTo=${req.body.dateTo ?? ''}&compareDateFrom=${req.body.compareDateFrom ?? ''}&compareDateTo=${req.body.compareDateTo ?? ''}`,
    )
  }
}
