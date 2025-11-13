import { differenceInDays, format, subDays, subMonths } from 'date-fns'
import { POStaffProfileController } from '../staff-profile-personal-officer/controller'

export class KWStaffProfileController extends POStaffProfileController {
  protected override directory = 'staff-profile-key-worker'

  protected override defaultDateRange = () => {
    const to = new Date()
    const from = subMonths(to, 1)
    const comparisonTo = subDays(from, 1)
    const comparisonFrom = subDays(comparisonTo, differenceInDays(to, from))

    return {
      to: format(to, 'yyyy-MM-dd'),
      from: format(from, 'yyyy-MM-dd'),
      comparisonTo: format(comparisonTo, 'yyyy-MM-dd'),
      comparisonFrom: format(comparisonFrom, 'yyyy-MM-dd'),
    }
  }
}
