import { dataAccess } from '../data'
import AuditService from './auditService'
import KeyworkerApiService from './keyworkerApi/keyworkerApiService'
import LocationsInsidePrisonApiService from './locationsInsidePrisonApi/locationsInsidePrisonApiService'
import PrisonApiService from './prisonApi/prisonApiService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, keyworkerApiClient, prisonApiClient, locationsWithinPrisonApiClient } =
    dataAccess()

  const auditService = new AuditService(hmppsAuditClient)
  const keyworkerApiService = new KeyworkerApiService(keyworkerApiClient)
  const prisonApiService = new PrisonApiService(prisonApiClient)
  const locationsApiService = new LocationsInsidePrisonApiService(locationsWithinPrisonApiClient)

  return {
    applicationInfo,
    auditService,
    keyworkerApiService,
    prisonApiService,
    locationsApiService,
  }
}

export type Services = ReturnType<typeof services>
