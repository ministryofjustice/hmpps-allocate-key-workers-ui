import { getAlertFlagLabelsForAlerts } from '@ministryofjustice/hmpps-connect-dps-shared-items'

export const getAlertLabelsForCodes = (relevantCodes: string[]) => {
  return getAlertFlagLabelsForAlerts(
    relevantCodes.map(code => {
      return {
        alertType: '',
        alertCode: code,
        active: true,
        expired: false,
      }
    }),
  )
}
