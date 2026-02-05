import { components } from '../../../@types/keyWorker'

export const parseStaffDetails = (details: components['schemas']['StaffDetails']) => ({
  capacity: details.capacity,
  status: details.status.code,
  staffRole: {
    position: details.staffRole!.position.code,
    scheduleType: details.staffRole!.scheduleType.code,
    hoursPerWeek: details.staffRole!.hoursPerWeek,
    fromDate: details.staffRole!.fromDate,
  },
})
