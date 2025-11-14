import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns'
import { StaffProfileController } from '../staff-profile/abstractController'

export class POStaffProfileController extends StaffProfileController {
  protected directory = 'staff-profile-personal-officer'

  protected defaultDateRange = () => {
    const lastDay = new Date()
    const firstDay = startOfMonth(lastDay)
    const previousMonth = subMonths(firstDay, 1)

    return {
      from: format(firstDay, 'yyyy-MM-dd'),
      to: format(lastDay, 'yyyy-MM-dd'),
      comparisonFrom: format(startOfMonth(previousMonth), 'yyyy-MM-dd'),
      comparisonTo: format(endOfMonth(previousMonth), 'yyyy-MM-dd'),
    }
  }
}
