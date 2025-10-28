import { Request, RequestHandler, Response } from 'express'
import setUpJourneyData from './setUpJourneyData'
import CacheInterface from '../../data/cache/cacheInterface'
import { JourneyData } from '../../@types/express'

let middleware: RequestHandler

let req: Request
let res: Response
let cacheStore: CacheInterface<JourneyData>

let journeyId: string

const next = jest.fn()

beforeEach(() => {
  journeyId = Math.random().toString(36).slice(2)

  res = {
    locals: {},
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
    cacheStore = {
      get: async () => null,
      set: jest.fn(),
      del: jest.fn(),
    }

    middleware = setUpJourneyData(cacheStore)

    expect(req.journeyData).toBeUndefined()
    await middleware(req, res, next)
    expect(req.journeyData).not.toBeUndefined()
    expect(req.journeyData.instanceUnixEpoch).not.toBeUndefined()
  })

  it('should read journey data from store', async () => {
    cacheStore = {
      get: async () => ({ instanceUnixEpoch: 1234 }),
      set: jest.fn(),
      del: jest.fn(),
    }

    middleware = setUpJourneyData(cacheStore)

    await middleware(req, res, next)
    expect(req.journeyData.instanceUnixEpoch).toEqual(1234)
  })

  it('should save journey data to store', async () => {
    cacheStore = {
      get: async () => ({ instanceUnixEpoch: 1234 }),
      set: jest.fn(),
      del: jest.fn(),
    }

    middleware = setUpJourneyData(cacheStore)

    await middleware(req, res, next)
    req.journeyData.instanceUnixEpoch = 4321
    await res.send('end')
    expect(cacheStore.set).toHaveBeenCalledWith(`tester.${journeyId}`, { instanceUnixEpoch: 4321 }, 20 * 60 * 60)
  })
})
