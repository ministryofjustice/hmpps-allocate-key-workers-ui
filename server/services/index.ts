import { dataAccess } from '../data'
import AuditService from './auditService'
import KeyworkerApiService from './keyworkerApi/keyworkerApiService'
import PrisonApiService from './prisonApi/prisonApiService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, keyworkerApiClient, prisonApiClient } = dataAccess()

  const auditService = new AuditService(hmppsAuditClient)
  const keyworkerApiService = new KeyworkerApiService(keyworkerApiClient)
  const prisonApiService = new PrisonApiService(prisonApiClient)

  return {
    applicationInfo,
    auditService,
    keyworkerApiService,
    prisonApiService,
  }
}

export type Services = ReturnType<typeof services>
