/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { buildAppInsightsClient, initialiseAppInsights } from '../utils/azureAppInsights'
import applicationInfoSupplier from '../applicationInfo'
import HmppsAuthClient from './hmppsAuthClient'
import { createRedisClient } from './redisClient'
import RedisTokenStore from './tokenStore/redisTokenStore'
import InMemoryTokenStore from './tokenStore/inMemoryTokenStore'
import config from '../config'
import HmppsAuditClient from './hmppsAuditClient'
import PrisonApiRestClient from '../services/prisonApi/prisonApiClient'
import KeyworkerApiClient from '../services/keyworkerApi/keyworkerApiClient'
import LocationsInsidePrisonApiRestClient from '../services/locationsInsidePrisonApi/locationsInsidePrisonApiClient'
import PrisonerSearchApiRestClient from '../services/prisonerSearch/prisonerSearchApiClient'

const applicationInfo = applicationInfoSupplier()
initialiseAppInsights()
buildAppInsightsClient(applicationInfo)

type RestClientBuilder<T> = (token: string) => T

export const dataAccess = () => ({
  applicationInfo,
  hmppsAuthClient: new HmppsAuthClient(
    config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore(),
  ),
  hmppsAuditClient: new HmppsAuditClient(config.sqs.audit),
  keyworkerApiClient: (token: string) => new KeyworkerApiClient(token),
  prisonApiClient: (token: string) => new PrisonApiRestClient(token),
  locationsWithinPrisonApiClient: (token: string) => new LocationsInsidePrisonApiRestClient(token),
  prisonerSearchApiClient: (token: string) => new PrisonerSearchApiRestClient(token),
})

export type DataAccess = ReturnType<typeof dataAccess>

export { HmppsAuthClient, RestClientBuilder, HmppsAuditClient }
