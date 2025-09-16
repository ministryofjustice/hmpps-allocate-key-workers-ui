import type { Request, Response } from 'express'

import { createBackUrlFor, getBreadcrumbs, historyMiddleware } from './historyMiddleware'
import { historyToBase64 } from '../utils/testUtils'

describe('historyMiddleware', () => {
  const req: Request = {} as jest.Mocked<Request>
  const next = jest.fn()

  function createRes(): Response {
    return {
      setAuditDetails: {
        suppress: () => {},
      },
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
    req.originalUrl = '/key-worker/allocate'
    req.method = 'GET'
    historyMiddleware()(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(
      `/key-worker/allocate?history=${historyToBase64(['/key-worker', '/key-worker/allocate'], true)}`,
    )
  })

  it('should ignore non GET/POSTs', () => {
    const res = createRes()

    req.query = { history: historyToBase64(['/key-worker']) }
    req.originalUrl = `/key-worker/allocate?history=${historyToBase64(['/key-worker'])}`
    req.method = 'PUT'
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
        href: '/key-worker?history=H4sIAAAAAAAAE4tW0s9OrdQtzy%2FKTi1SigUAMcSdpA8AAAA%3D',
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

  it('should construct backUrl correctly when given valid history', () => {
    const b64History = historyToBase64([
      '/key-worker',
      '/key-worker/allocate',
      '/key-worker/staff-profile/488095',
      '/key-worker/staff-profile/488095/case-notes',
      '/key-worker/start-update-staff/488095',
    ])
    const res = { locals: { b64History } }
    const backUrl = createBackUrlFor(res as Response, /staff-profile/, `default`)
    expect(backUrl).toBe(
      `/key-worker/staff-profile/488095/case-notes?history=${historyToBase64(['/key-worker', '/key-worker/allocate', '/key-worker/staff-profile/488095', '/key-worker/staff-profile/488095/case-notes'], true)}`,
    )
  })

  it('should use fallback value when history is invalid', () => {
    const b64History = ''
    const res = { locals: { b64History } }
    const backUrl = createBackUrlFor(res as Response, /staff-profile/, `default`)
    expect(backUrl).toBe(`default?history=${historyToBase64([], true)}`)
  })

  it('should inject history when a POST redirect GET is made without explicitly setting it', () => {
    const res = createRes()

    req.query = {
      history: historyToBase64(['/key-worker']),
    }

    req.originalUrl = `/key-worker/allocate`
    req.method = 'GET'
    req.get = jest.fn().mockReturnValue('localhost')

    const originalRedirect = res.redirect
    historyMiddleware()(req, res, next)

    // POST isnt explicit here - this just simulates a redirect on a POST endpoint (the same works for GET)
    res.redirect('/key-worker/allocate?excludeActiveAllocations=true')

    expect(originalRedirect).toHaveBeenCalledWith(
      302,
      `undefined://localhost/key-worker/allocate?excludeActiveAllocations=true&history=${historyToBase64(['/key-worker', '/key-worker/allocate?excludeActiveAllocations=true'], true)}`,
    )

    expect(next).toHaveBeenCalled()
  })

  it('should not add a breadcrumb for the current page', () => {
    const res = {
      locals: {
        policyStaff: 'key worker',
        policyStaffs: 'key workers',
        policyPath: 'key-worker',
        history: [
          '/key-worker',
          '/key-worker/allocate',
          '/key-worker/staff-profile/488095',
          '/key-worker/staff-profile/488095/case-notes',
        ],
      },
    }

    req.originalUrl = `/key-worker/staff-profile/488095/case-notes`
    req.method = 'GET'
    req.get = jest.fn().mockReturnValue('localhost')

    const breadcrumbs = getBreadcrumbs(req, res as Response)
    expect(breadcrumbs).toEqual([
      {
        alias: 'HOMEPAGE',
        href: '/key-worker?history=H4sIAAAAAAAAE4tW0s9OrdQtzy%2FKTi1SigUAMcSdpA8AAAA%3D',
        text: 'Key workers',
      },
      {
        alias: 'ALLOCATE',
        href: `/key-worker/allocate?history=${historyToBase64(['/key-worker', '/key-worker/allocate'], true)}`,
        text: 'Allocate key workers',
      },
    ])
  })
})
