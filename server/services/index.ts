import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { PermissionsService } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { dataAccess } from '../data'
import AuditService from './auditService'
import AllocationsApiService from './allocationsApi/allocationsApiService'
import LocationsInsidePrisonApiService from './locationsInsidePrisonApi/locationsInsidePrisonApiService'
import PrisonApiService from './prisonApi/prisonApiService'
import PrisonerSearchApiService from './prisonerSearch/prisonerSearchApiService'
import logger from '../../logger'
import config from '../config'

export const services = () => {
  const {
    applicationInfo,
    hmppsAuthClient,
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
  const allocationsApiService = new AllocationsApiService(keyworkerApiClient, cacheStore)
  const prisonApiService = new PrisonApiService(prisonApiClient)
  const locationsApiService = new LocationsInsidePrisonApiService(locationsWithinPrisonApiClient)
  const prisonerSearchApiService = new PrisonerSearchApiService(prisonerSearchApiClient)
  const authenticationClient = new AuthenticationClient(config.apis.hmppsAuth, logger, tokenStore)

  const prisonPermissionsService = PermissionsService.create({
    prisonerSearchConfig: config.apis.prisonerSearchApi,
    authenticationClient,
    logger,
    telemetryClient,
  })

  return {
    applicationInfo,
    hmppsAuthClient,
    auditService,
    allocationsApiService,
    prisonApiService,
    locationsApiService,
    prisonerSearchApiService,
    prisonPermissionsService,
    authenticationClient,
    cacheStore,
  }
}

export type Services = ReturnType<typeof services>
