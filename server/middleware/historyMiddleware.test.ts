import type { Request, Response } from 'express'

import { historyMiddlware, getLastDifferentPageNotMatching, getLast } from './historyMiddleware'

describe('historyMiddleware', () => {
  const next = jest.fn()

  function createResWithToken(): Response {
    return {
      locals: {},
      redirect: jest.fn(),
    } as unknown as Response
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should set historyBackUrl in res.locals to the last different page in history', () => {
    const res = createResWithToken()

    const reqSession = {}
    const middleware = historyMiddlware(/journey-start/)
    middleware({ method: 'GET', originalUrl: '/policy-home', session: reqSession } as jest.Mocked<Request>, res, next)
    middleware(
      { method: 'GET', originalUrl: '/policy-home/feature-landing', session: reqSession } as jest.Mocked<Request>,
      res,
      next,
    )
    middleware(
      {
        method: 'GET',
        originalUrl: '/policy-home/feature-landing/journey-start',
        session: reqSession,
      } as jest.Mocked<Request>,
      res,
      next,
    )
    middleware(
      { method: 'GET', originalUrl: '/policy-home/uuid/feature-page-one', session: reqSession } as jest.Mocked<Request>,
      res,
      next,
    )

    expect(res.locals.historyBackUrl).toBe('/policy-home/feature-landing')
    expect(next).toHaveBeenCalled()
  })

  it('should return last different page not matching a passed regex', () => {
    const res = createResWithToken()

    const reqSession = {}
    const middleware = historyMiddlware(/journey-start/)
    middleware({ method: 'GET', originalUrl: '/policy-home', session: reqSession } as jest.Mocked<Request>, res, next)
    middleware(
      { method: 'GET', originalUrl: '/policy-home/feature-landing', session: reqSession } as jest.Mocked<Request>,
      res,
      next,
    )
    middleware(
      {
        method: 'GET',
        originalUrl: '/policy-home/feature-landing/journey-start',
        session: reqSession,
      } as jest.Mocked<Request>,
      res,
      next,
    )
    middleware(
      { method: 'GET', originalUrl: '/policy-home/uuid/feature-page-one', session: reqSession } as jest.Mocked<Request>,
      res,
      next,
    )

    expect(
      getLastDifferentPageNotMatching(
        {
          method: 'GET',
          originalUrl: '/policy-home/uuid/feature-page-one',
          session: reqSession,
        } as jest.Mocked<Request>,
        /feature-landing/,
      ),
    ).toBe('/policy-home')
    expect(next).toHaveBeenCalled()
  })

  it('should return the penultimate history entry when getLast() is called', () => {
    const res = createResWithToken()

    const reqSession = {}
    const middleware = historyMiddlware(/journey-start/)
    middleware({ method: 'GET', originalUrl: '/policy-home', session: reqSession } as jest.Mocked<Request>, res, next)
    middleware(
      { method: 'GET', originalUrl: '/policy-home/feature-landing', session: reqSession } as jest.Mocked<Request>,
      res,
      next,
    )
    middleware(
      {
        method: 'GET',
        originalUrl: '/policy-home/feature-landing/journey-start',
        session: reqSession,
      } as jest.Mocked<Request>,
      res,
      next,
    )
    middleware(
      { method: 'GET', originalUrl: '/policy-home/uuid/feature-page-one', session: reqSession } as jest.Mocked<Request>,
      res,
      next,
    )

    expect(
      getLast({
        method: 'GET',
        originalUrl: '/policy-home/uuid/feature-page-one',
        session: reqSession,
      } as jest.Mocked<Request>),
    ).toBe('/policy-home/feature-landing')
    expect(next).toHaveBeenCalled()
  })

  it('should correctly rollback history when a historical back is accessed', () => {
    const res = createResWithToken()

    const reqSession = {}
    const middleware = historyMiddlware(/journey-start/)
    // Create some navigation noise
    middleware({ method: 'GET', originalUrl: '/policy-home', session: reqSession } as jest.Mocked<Request>, res, next)
    middleware(
      { method: 'GET', originalUrl: '/policy-home/feature-landing', session: reqSession } as jest.Mocked<Request>,
      res,
      next,
    )
    middleware(
      {
        method: 'GET',
        originalUrl: '/policy-home/feature-landing/journey-start',
        session: reqSession,
      } as jest.Mocked<Request>,
      res,
      next,
    )
    middleware(
      { method: 'GET', originalUrl: '/policy-home/uuid/feature-page-one', session: reqSession } as jest.Mocked<Request>,
      res,
      next,
    )
    middleware(
      { method: 'GET', originalUrl: '/policy-home/uuid/feature-page-two', session: reqSession } as jest.Mocked<Request>,
      res,
      next,
    )

    // Imaginary "back" url that links back to the feature landing page
    middleware(
      { method: 'GET', originalUrl: '/policy-home/feature-landing', session: reqSession } as jest.Mocked<Request>,
      res,
      next,
    )

    expect(res.locals.historyBackUrl).toBe('/policy-home')
    expect(next).toHaveBeenCalled()
  })

  it('should set historyBackUrl to the referer header if no history exists in session', () => {
    const res = createResWithToken()

    const reqSession = {}
    const middleware = historyMiddlware(/journey-start/)
    middleware(
      {
        method: 'GET',
        originalUrl: '/policy-home',
        session: reqSession,
        headers: { referer: 'http://outside-service.gov.uk' },
      } as jest.Mocked<Request>,
      res,
      next,
    )
    expect(res.locals.historyBackUrl).toBe('http://outside-service.gov.uk')
  })

  it('should set historyBackUrl to "/" if no history exists in session and no referer header', () => {
    const res = createResWithToken()

    const reqSession = {}
    const middleware = historyMiddlware(/journey-start/)
    middleware({ method: 'GET', originalUrl: '/policy-home', session: reqSession } as jest.Mocked<Request>, res, next)
    expect(res.locals.historyBackUrl).toBe('/')
  })
})
