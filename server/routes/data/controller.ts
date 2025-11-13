import { format, lastDayOfMonth, startOfMonth, subMonths, isLastDayOfMonth, endOfMonth } from 'date-fns'
import { POStaffDataController } from '../data-personal-officer/controller'

export class KWStaffDataController extends POStaffDataController {
  protected override directory = 'data'

  protected override defaultDateRange = () => {
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
}
