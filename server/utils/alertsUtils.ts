import { alertFlagLabels } from '@ministryofjustice/hmpps-connect-dps-shared-items'

export const getAlertLabelsForCodes = (relevantCodes: string[]) => {
  return alertFlagLabels.filter(flagLabel => {
    return flagLabel.alertCodes.some(alertCode => relevantCodes.includes(alertCode))
  })
}
