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
import KeyworkerApiClient from '../services/keyworkerApi/keyworkerApiClient'
import LocationsInsidePrisonApiRestClient from '../services/locationsInsidePrisonApi/locationsInsidePrisonApiClient'
import PrisonerSearchApiRestClient from '../services/prisonerSearch/prisonerSearchApiClient'

const applicationInfo = applicationInfoSupplier()
initialiseAppInsights()
buildAppInsightsClient(applicationInfo)

type RestClientBuilder<T> = (token: string) => T
type EnhancedRestClientBuilder<T> = (req: Request, res?: Response) => T

const tokenStore = config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore()

export const dataAccess = () => ({
  applicationInfo,
  hmppsAuthClient: new HmppsAuthClient(tokenStore),
  hmppsAuditClient: new HmppsAuditClient(config.sqs.audit),
  keyworkerApiClient: (req: Request, res?: Response) => new KeyworkerApiClient(req, res),
  prisonApiClient: (token: string) => new PrisonApiRestClient(token),
  locationsWithinPrisonApiClient: (token: string) => new LocationsInsidePrisonApiRestClient(token),
  prisonerSearchApiClient: (token: string) => new PrisonerSearchApiRestClient(token),
  tokenStore,
})

export type DataAccess = ReturnType<typeof dataAccess>

export { HmppsAuthClient, RestClientBuilder, EnhancedRestClientBuilder, HmppsAuditClient }
