import { Request, Response } from 'express'
import { format, lastDayOfMonth, startOfMonth, subMonths, isLastDayOfMonth, differenceInDays, subDays } from 'date-fns'
import AllocationsApiService from '../../services/allocationsApi/allocationsApiService'
import { formatDateConcise } from '../../utils/datetimeUtils'
import { ResQuerySchemaType } from './schema'
import { getEstablishmentData } from './utils'

export class StaffDataController {
  constructor(private readonly allocationsApiService: AllocationsApiService) {}

  private getDateAsIsoString = () => {
    const today = new Date()
    const lastDay = isLastDayOfMonth(today) ? today : lastDayOfMonth(subMonths(today, 1))
    const firstDay = startOfMonth(lastDay)

    return {
      dateFrom: format(firstDay, 'yyyy-MM-dd'),
      dateTo: format(lastDay, 'yyyy-MM-dd'),
    }
  }

  private addComparisonDates = ({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) => {
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
    const dateRange = this.addComparisonDates(resQuery?.validated ?? this.getDateAsIsoString())
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
      dateFrom: resQuery?.dateFrom ?? formatDateConcise(stats.current?.from),
      dateTo: resQuery?.dateTo ?? formatDateConcise(stats.current?.to),
      dateUpdated: new Date().toISOString(),
    })
  }

  POST = async (req: Request, res: Response) => {
    const searchParams = new URLSearchParams({
      dateFrom: req.body.dateFrom,
      dateTo: req.body.dateTo,
    })
    res.redirect(`data?${searchParams.toString()}`)
  }
}
