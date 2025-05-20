import { Request, RequestHandler, Response } from 'express'
import { v4 as uuidV4 } from 'uuid'
import setUpJourneyData from './setUpJourneyData'
import TokenStore from '../../data/tokenStore/tokenStore'

let middleware: RequestHandler

let req: Request
let res: Response
let tokenStore: TokenStore

let journeyId: string

const next = jest.fn()

beforeEach(() => {
  journeyId = uuidV4()

  res = {
    callback: () => null,
    redirect: jest.fn(),
    prependOnceListener: (_: string, cb: () => void) => {
      // @ts-expect-error null object
      this.callback = cb
    },
    send: () => {
      // @ts-expect-error null object
      this.callback()
    },
  } as unknown as Response

  req = {
    user: { username: 'tester' },
    session: {},
    params: { journeyId },
  } as unknown as Request
})

describe('setUpJourneyData', () => {
  it('should create a new journey data when no key is stored', async () => {
    tokenStore = {
      getToken: async () => null,
      setToken: jest.fn(),
      delToken: jest.fn(),
    }

    middleware = setUpJourneyData(tokenStore)

    expect(req.journeyData).toBeUndefined()
    await middleware(req, res, next)
    expect(req.journeyData).not.toBeUndefined()
    expect(req.journeyData.instanceUnixEpoch).not.toBeUndefined()
  })

  it('should read journey data from store', async () => {
    tokenStore = {
      getToken: async () => `{ "instanceUnixEpoch" : 1234 }`,
      setToken: jest.fn(),
      delToken: jest.fn(),
    }

    middleware = setUpJourneyData(tokenStore)

    await middleware(req, res, next)
    expect(req.journeyData.instanceUnixEpoch).toEqual(1234)
  })

  it('should save journey data to store', async () => {
    tokenStore = {
      getToken: async () => `{ "instanceUnixEpoch" : 1234 }`,
      setToken: jest.fn(),
      delToken: jest.fn(),
    }

    middleware = setUpJourneyData(tokenStore)

    await middleware(req, res, next)
    req.journeyData.instanceUnixEpoch = 4321
    await res.send('end')
    expect(tokenStore.setToken).toHaveBeenCalledWith(
      `journey.tester.${journeyId}`,
      '{"instanceUnixEpoch":4321}',
      20 * 60 * 60,
    )
  })
})
