import type { Request, Response } from 'express'

import { createBackUrlFor, getBreadcrumbs, getHistoryParamForPOST, historyMiddleware } from './historyMiddleware'
import { historyToBase64 } from '../utils/testUtils'

describe('historyMiddleware', () => {
  const req: Request = {} as jest.Mocked<Request>
  const next = jest.fn()

  function createRes(): Response {
    return {
      locals: {
        policyPath: 'key-worker',
        policyStaff: 'key worker',
        policyStaffs: 'key workers',
        history: [],
      },
      redirect: jest.fn(),
    } as unknown as Response
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should redirect to the same page with a history query param added when called with no history', () => {
    const res = createRes()

    req.headers = { referer: 'http://0.0.0.0:3000/key-worker' }
    req.query = {}
    req.originalUrl = '/key-worker'
    req.method = 'GET'
    historyMiddleware()(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(`/key-worker?history=${historyToBase64(['/key-worker'])}`)
  })

  it('should add url to the history param', () => {
    const res = createRes()

    req.query = { history: historyToBase64(['/key-worker']) }
    req.originalUrl = `/key-worker/allocate?history=${historyToBase64(['/key-worker'])}`
    req.method = 'GET'
    historyMiddleware()(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.locals.history).toEqual(['/key-worker', '/key-worker/allocate'])
  })

  it('should ignore non GETs', () => {
    const res = createRes()

    req.query = { history: historyToBase64(['/key-worker']) }
    req.originalUrl = `/key-worker/allocate?history=${historyToBase64(['/key-worker'])}`
    req.method = 'POST'
    historyMiddleware()(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.locals.history).toEqual([])
  })

  it('should ignore urls in excludeUrls', () => {
    const res = createRes()

    req.query = { history: historyToBase64(['/key-worker']) }
    req.originalUrl = `/key-worker/allocate?history=${historyToBase64(['/key-worker'])}`
    req.method = 'GET'
    historyMiddleware(/\/key-worker\/allocate/)(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.locals.history).toEqual(['/key-worker'])
  })

  it('should support noJS building history with referer url and current url', () => {
    const res = createRes()

    req.headers = { referer: `/key-worker?history=${historyToBase64(['/key-worker'])}` }
    req.query = { history: historyToBase64(['/key-worker']) }
    req.originalUrl = `/key-worker/allocate`
    req.method = 'GET'
    historyMiddleware()(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.locals.history).toEqual(['/key-worker', '/key-worker/allocate'])
  })

  it('should create breadcrumbs for a deep page', () => {
    const res = createRes()

    req.query = {
      history: historyToBase64([
        '/key-worker',
        '/key-worker/allocate?excludeActiveAllocations=true',
        '/key-worker/recommend-allocations',
        '/key-worker/prisoner-allocation-history/A0262EA',
      ]),
    }
    req.originalUrl = `/key-worker/prisoner-allocation-history/A0262EA?history=${req.query['history']}}`
    req.method = 'GET'
    historyMiddleware()(req, res, next)

    expect(next).toHaveBeenCalled()

    expect(getBreadcrumbs(req, res)).toEqual([
      {
        alias: 'HOMEPAGE',
        href: `/key-worker?history=${historyToBase64(['/key-worker'], true)}`,
        text: 'Key workers',
      },
      {
        alias: 'ALLOCATE',
        href: `/key-worker/allocate?excludeActiveAllocations=true&history=${historyToBase64(['/key-worker', '/key-worker/allocate?excludeActiveAllocations=true'], true)}`,
        text: 'Allocate key workers',
      },
      {
        alias: 'RECOMMENDED_ALLOCATIONS',
        href: `/key-worker/recommend-allocations?history=${historyToBase64(['/key-worker', '/key-worker/allocate?excludeActiveAllocations=true', '/key-worker/recommend-allocations'], true)}`,
        text: 'Allocate key workers automatically',
      },
    ])
  })

  it('should handle POST requests that redirect without preserving history and prune same page navigations', () => {
    const res = createRes()

    req.headers = {
      referer: `http://0.0.0.0:3000/key-worker/allocate?history=${historyToBase64(['/key-worker', '/key-worker/allocate'])}`,
    }
    req.query = {} // Empty query where a POST request just redirects to a page without preserving history
    req.originalUrl = `/key-worker/allocate?query=&cellLocationPrefix=&excludeActiveAllocations=true`
    req.method = 'GET'
    historyMiddleware()(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(
      `/key-worker/allocate?query=&cellLocationPrefix=&excludeActiveAllocations=true&history=${historyToBase64(['/key-worker', '/key-worker/allocate?query=&cellLocationPrefix=&excludeActiveAllocations=true'], true)}`,
    )
  })

  it('should return base64 history using referer header when no target page is provided', () => {
    req.headers = {
      referer: `http://0.0.0.0:3000/key-worker/allocate?history=${historyToBase64(['/key-worker', '/key-worker/allocate'])}`,
    }
    req.query = {}
    req.originalUrl = `/key-worker/allocate/filter`
    const history = getHistoryParamForPOST(req)

    expect(history).toBe(historyToBase64(['/key-worker', '/key-worker/allocate']))
  })

  it('should return base64 history for POST redirect when target page is provided', () => {
    req.headers = {
      referer: `http://0.0.0.0:3000/key-worker/allocate?history=${historyToBase64(['/key-worker', '/key-worker/allocate'])}`,
    }
    req.query = {}
    req.originalUrl = `/key-worker/allocate/filter`
    const history = getHistoryParamForPOST(req, '/key-worker/allocate', new URLSearchParams({ query: 'test' }))

    expect(history).toBe(historyToBase64(['/key-worker', '/key-worker/allocate?query=test']))
  })

  it('should construct backUrl correctly when given valid history', () => {
    const b64History = historyToBase64([
      '/key-worker',
      '/key-worker/allocate',
      '/key-worker/staff-profile/488095',
      '/key-worker/staff-profile/488095/case-notes',
      '/key-worker/start-update-staff/488095',
    ])
    const backUrl = createBackUrlFor(b64History, /staff-profile/, `default`)
    expect(backUrl).toBe(
      `/key-worker/staff-profile/488095/case-notes?history=${historyToBase64(['/key-worker', '/key-worker/allocate', '/key-worker/staff-profile/488095', '/key-worker/staff-profile/488095/case-notes'], true)}`,
    )
  })

  it('should use fallback value when history is invalid', () => {
    const b64History = ''
    const backUrl = createBackUrlFor(b64History, /staff-profile/, `default`)
    expect(backUrl).toBe(`default?history=${historyToBase64([], true)}`)
  })
})
