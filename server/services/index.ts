import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { PermissionsService } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { dataAccess } from '../data'
import AuditService from './auditService'
import KeyworkerApiService from './keyworkerApi/keyworkerApiService'
import LocationsInsidePrisonApiService from './locationsInsidePrisonApi/locationsInsidePrisonApiService'
import PrisonApiService from './prisonApi/prisonApiService'
import PrisonerSearchApiService from './prisonerSearch/prisonerSearchApiService'
import logger from '../../logger'
import config from '../config'

export const services = () => {
  const {
    applicationInfo,
    hmppsAuditClient,
    keyworkerApiClient,
    prisonApiClient,
    locationsWithinPrisonApiClient,
    prisonerSearchApiClient,
    telemetryClient,
    tokenStore,
    cacheStore,
  } = dataAccess()

  const auditService = new AuditService(hmppsAuditClient)
  const keyworkerApiService = new KeyworkerApiService(keyworkerApiClient, cacheStore)
  const prisonApiService = new PrisonApiService(prisonApiClient)
  const locationsApiService = new LocationsInsidePrisonApiService(locationsWithinPrisonApiClient)
  const prisonerSearchApiService = new PrisonerSearchApiService(prisonerSearchApiClient)

  const prisonPermissionsService = PermissionsService.create({
    prisonerSearchConfig: config.apis.prisonerSearchApi,
    authenticationClient: new AuthenticationClient(config.apis.hmppsAuth, logger, tokenStore),
    logger,
    telemetryClient,
  })

  return {
    applicationInfo,
    auditService,
    keyworkerApiService,
    prisonApiService,
    locationsApiService,
    prisonerSearchApiService,
    prisonPermissionsService,
  }
}

export type Services = ReturnType<typeof services>
