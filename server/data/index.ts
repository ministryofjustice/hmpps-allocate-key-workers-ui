import { Request, Response } from 'express'
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
import AllocationsApiClient from '../services/allocationsApi/allocationsApiClient'
import LocationsInsidePrisonApiRestClient from '../services/locationsInsidePrisonApi/locationsInsidePrisonApiClient'
import PrisonerSearchApiRestClient from '../services/prisonerSearch/prisonerSearchApiClient'
import RedisCache from './cache/redisCache'
import InMemoryCache from './cache/inMemoryCache'
import CacheInterface from './cache/cacheInterface'

const applicationInfo = applicationInfoSupplier()
initialiseAppInsights()
const telemetryClient = buildAppInsightsClient(applicationInfo)!

type RestClientBuilder<T> = (token: string) => T
type EnhancedRestClientBuilder<T> = (req: Request, res?: Response) => T

const redisClient = config.redis.enabled ? createRedisClient() : null

const tokenStore = redisClient ? new RedisTokenStore(redisClient) : new InMemoryTokenStore()

export const dataAccess = () => ({
  applicationInfo,
  hmppsAuthClient: new HmppsAuthClient(tokenStore),
  hmppsAuditClient: new HmppsAuditClient(config.sqs.audit),
  keyworkerApiClient: (req: Request, res?: Response) => new AllocationsApiClient(req, res),
  prisonApiClient: (token: string) => new PrisonApiRestClient(token),
  locationsWithinPrisonApiClient: (token: string) => new LocationsInsidePrisonApiRestClient(token),
  prisonerSearchApiClient: (token: string) => new PrisonerSearchApiRestClient(token),
  tokenStore,
  telemetryClient,
  cacheStore: <T>(prefix: string): CacheInterface<T> =>
    redisClient ? new RedisCache<T>(redisClient, prefix) : new InMemoryCache<T>(prefix),
})

export type DataAccess = ReturnType<typeof dataAccess>

export { HmppsAuthClient, RestClientBuilder, EnhancedRestClientBuilder, HmppsAuditClient }
