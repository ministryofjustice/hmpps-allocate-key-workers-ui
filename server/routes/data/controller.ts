import { Request, Response } from 'express'
import { format, lastDayOfMonth, startOfMonth, subMonths, isLastDayOfMonth, endOfMonth } from 'date-fns'
import { formatDateConcise } from '../../utils/datetimeUtils'
import { ResQuerySchemaType } from '../data-personal-officer/schema'
import { getEstablishmentData } from './utils'
import { POStaffDataController } from '../data-personal-officer/controller'

export class StaffDataController extends POStaffDataController {
  protected override getDateAsIsoString = () => {
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

  override GET = async (req: Request, res: Response) => {
    const resQuery = res.locals['query'] as ResQuerySchemaType
    const dateRange = resQuery?.validated ? this.addComparisonDates(resQuery.validated) : this.getDateAsIsoString()
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
}
