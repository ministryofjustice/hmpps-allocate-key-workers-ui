import nock from 'nock'

import config from '../config'
import HmppsAuthClient from './hmppsAuthClient'
import TokenStore from './tokenStore/redisTokenStore'
import { RedisClient } from './redisClient'

jest.mock('./tokenStore/redisTokenStore')

const redisClient = {
  get: jest.fn(),
  set: jest.fn(),
  on: jest.fn(),
  connect: jest.fn(),
  isOpen: true,
} as unknown as jest.Mocked<RedisClient>

const tokenStore = new TokenStore(redisClient) as jest.Mocked<TokenStore>

const username = 'Bob'
const token = { access_token: 'token-1', expires_in: 300 }

describe('hmppsAuthClient', () => {
  let fakeHmppsAuthApi: nock.Scope
  let hmppsAuthClient: HmppsAuthClient

  beforeEach(() => {
    fakeHmppsAuthApi = nock(config.apis.hmppsAuth.url)
    hmppsAuthClient = new HmppsAuthClient(tokenStore)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getSystemClientToken', () => {
    it('should instantiate the redis client', async () => {
      tokenStore.getToken.mockResolvedValue(token.access_token)
      await hmppsAuthClient.getSystemClientToken(username)
    })

    it('should return token from redis if one exists', async () => {
      tokenStore.getToken.mockResolvedValue(token.access_token)
      const output = await hmppsAuthClient.getSystemClientToken(username)
      expect(output).toEqual(token.access_token)
    })

    it('should return token from HMPPS Auth with username', async () => {
      tokenStore.getToken.mockResolvedValue(null)

      fakeHmppsAuthApi
        .post('/oauth/token', 'grant_type=client_credentials&username=Bob')
        .basicAuth({ user: config.apis.hmppsAuth.systemClientId, pass: config.apis.hmppsAuth.systemClientSecret })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, token)

      const output = await hmppsAuthClient.getSystemClientToken(username)

      expect(output).toEqual(token.access_token)
      expect(tokenStore.setToken).toHaveBeenCalledWith('Bob', token.access_token, 240)
    })

    it('should return token from HMPPS Auth without username', async () => {
      tokenStore.getToken.mockResolvedValue(null)

      fakeHmppsAuthApi
        .post('/oauth/token', 'grant_type=client_credentials')
        .basicAuth({ user: config.apis.hmppsAuth.systemClientId, pass: config.apis.hmppsAuth.systemClientSecret })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, token)

      const output = await hmppsAuthClient.getSystemClientToken()

      expect(output).toEqual(token.access_token)
      expect(tokenStore.setToken).toHaveBeenCalledWith('%ANONYMOUS%', token.access_token, 240)
    })
  })
})
