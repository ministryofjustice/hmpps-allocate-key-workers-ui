import { Request, Response } from 'express'
import {
  format,
  startOfMonth,
  subDays,
  endOfMonth,
  subMonths,
  differenceInDays,
  isLastDayOfMonth,
  lastDayOfMonth,
} from 'date-fns'
import AllocationsApiService from '../../services/allocationsApi/allocationsApiService'
import { formatDateConcise } from '../../utils/datetimeUtils'
import { ResQuerySchemaType } from './schema'
import { getEstablishmentData } from './utils'
import { PolicyType } from '../../@types/policyType'

export class StaffDataController {
  constructor(protected readonly allocationsApiService: AllocationsApiService) {}

  protected defaultDateRange = (policy: PolicyType | undefined) => {
    if (policy === 'KEY_WORKER') {
      const today = new Date()
      const lastDay = isLastDayOfMonth(today) ? today : lastDayOfMonth(subMonths(today, 1))
      const firstDay = startOfMonth(lastDay)
      const previousMonth = subMonths(firstDay, 1)

      return {
        dateFrom: format(firstDay, 'yyyy-MM-dd'),
        dateTo: format(lastDay, 'yyyy-MM-dd'),
        compareDateFrom: format(startOfMonth(previousMonth), 'yyyy-MM-dd'),
        compareDateTo: format(endOfMonth(previousMonth), 'yyyy-MM-dd'),
      }
    }

    const lastDay = subDays(new Date(), 1)
    const firstDay = startOfMonth(lastDay)
    const previousMonth = subMonths(firstDay, 1)

    return {
      dateFrom: format(firstDay, 'yyyy-MM-dd'),
      dateTo: format(lastDay, 'yyyy-MM-dd'),
      compareDateFrom: format(startOfMonth(previousMonth), 'yyyy-MM-dd'),
      compareDateTo: format(endOfMonth(previousMonth), 'yyyy-MM-dd'),
    }
  }

  protected addComparisonDates = ({
    dateFrom,
    dateTo,
    compareDateFrom,
    compareDateTo,
  }: {
    dateFrom: string
    dateTo: string
    compareDateFrom: string | undefined
    compareDateTo: string | undefined
  }) => {
    if (compareDateFrom && compareDateTo) {
      return { dateFrom, dateTo, compareDateFrom, compareDateTo }
    }

    const lastDay = new Date(dateTo)
    const firstDay = new Date(dateFrom)

    const compareLastDay = subDays(firstDay, 1)
    const compareFirstDay = subDays(compareLastDay, differenceInDays(lastDay, firstDay))

    return {
      dateFrom,
      dateTo,
      compareDateFrom: format(compareFirstDay, 'yyyy-MM-dd'),
      compareDateTo: format(compareLastDay, 'yyyy-MM-dd'),
    }
  }

  GET = async (req: Request, res: Response) => {
    const resQuery = res.locals['query'] as ResQuerySchemaType
    const dateRange = resQuery?.validated
      ? this.addComparisonDates(resQuery.validated)
      : this.defaultDateRange(req.middleware?.policy)
    const prisonCode = res.locals.user.getActiveCaseloadId()!
    const stats = await this.allocationsApiService.getPrisonStats(
      req,
      prisonCode,
      dateRange.dateFrom,
      dateRange.dateTo,
      dateRange.compareDateFrom,
      dateRange.compareDateTo,
    )

    res.render('data/view', {
      showBreadcrumbs: true,
      stats,
      data: getEstablishmentData(stats, req),
      dateRange,
      dateFrom: resQuery?.dateFrom ?? formatDateConcise(dateRange.dateFrom),
      dateTo: resQuery?.dateTo ?? formatDateConcise(dateRange.dateTo),
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
