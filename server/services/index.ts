import { dataAccess } from '../data'
import AuditService from './auditService'
import KeyworkerApiService from './keyworkerApi/keyworkerApiService'
import LocationsInsidePrisonApiService from './locationsInsidePrisonApi/locationsInsidePrisonApiService'
import PrisonApiService from './prisonApi/prisonApiService'
import PrisonerSearchApiService from './prisonerSearch/prisonerSearchApiService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, keyworkerApiClient, prisonApiClient, locationsWithinPrisonApiClient, prisonerSearchApiClient } =
    dataAccess()

  const auditService = new AuditService(hmppsAuditClient)
  const keyworkerApiService = new KeyworkerApiService(keyworkerApiClient)
  const prisonApiService = new PrisonApiService(prisonApiClient)
  const locationsApiService = new LocationsInsidePrisonApiService(locationsWithinPrisonApiClient)
  const prisonerSearchApiService = new PrisonerSearchApiService(prisonerSearchApiClient)

  return {
    applicationInfo,
    auditService,
    keyworkerApiService,
    prisonApiService,
    locationsApiService,
    prisonerSearchApiService,
  }
}

export type Services = ReturnType<typeof services>
