import type { Request, Response } from 'express'
import removeTrailingSlashMiddleware from './removeTrailingSlashMiddleware'

describe('removeTrailingSlashMiddleware', () => {
  const res = { redirect: jest.fn() } as unknown as Response
  const next = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('remove slash at the end of the url', () => {
    removeTrailingSlashMiddleware(
      {
        url: '/bulk-alerts/start/',
      } as Request,
      res,
      next,
    )
    expect(res.redirect).toHaveBeenCalledWith('/bulk-alerts/start')
    expect(next).not.toHaveBeenCalled()
  })

  it('do not remove slash at the end of the url if it is part of a query string', () => {
    removeTrailingSlashMiddleware(
      {
        url: '/bulk-alerts/start?query=o/',
      } as Request,
      res,
      next,
    )
    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('remove slash at the end of the path when it is followed by a query string', () => {
    removeTrailingSlashMiddleware(
      {
        url: '/bulk-alerts/start/?query=test',
      } as Request,
      res,
      next,
    )
    expect(res.redirect).toHaveBeenCalledWith('/bulk-alerts/start?query=test')
    expect(next).not.toHaveBeenCalled()
  })
})
