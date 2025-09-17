import type { Request, Response } from 'express'
import { historyToBase64 } from '../../utils/testUtils'
import preventNavigationToExpiredJourneys from './preventNavigationToExpiredJourneys'

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

  it('should ignore most recent journey page when redirecting when journey has been marked completed', () => {
    const res = createRes()
    res.locals.b64History = historyToBase64([
      '/key-worker',
      '/key-worker/manage-roles',
      '/key-worker/manage-roles/remove',
      '/key-worker/3e680f74-8986-42f9-8dca-99725fdb46b6/manage-roles/remove',
    ])
    req.journeyData = {
      journeyCompleted: true,
      instanceUnixEpoch: Date.now(),
    }
    req.originalUrl = '/key-worker/3e680f74-8986-42f9-8dca-99725fdb46b6/manage-roles/remove/page'

    preventNavigationToExpiredJourneys()(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(
      `/key-worker/manage-roles/remove?history=${historyToBase64(['/key-worker', '/key-worker/manage-roles', '/key-worker/manage-roles/remove'], true)}`,
    )
  })

  it('should do nothing if journey is not completed', () => {
    const res = createRes()
    res.locals.b64History = historyToBase64([
      '/key-worker',
      '/key-worker/manage-roles',
      '/key-worker/manage-roles/remove',
      '/key-worker/3e680f74-8986-42f9-8dca-99725fdb46b6/manage-roles/remove',
    ])
    req.originalUrl = '/key-worker/3e680f74-8986-42f9-8dca-99725fdb46b6/manage-roles/remove/page'
    req.journeyData = {
      journeyCompleted: false,
      instanceUnixEpoch: Date.now(),
    }

    preventNavigationToExpiredJourneys()(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.redirect).not.toHaveBeenCalled()
  })

  it('should do nothing if on journey confirmation page', () => {
    const res = createRes()
    res.locals.b64History = historyToBase64([
      '/key-worker',
      '/key-worker/manage-roles',
      '/key-worker/manage-roles/remove',
      '/key-worker/3e680f74-8986-42f9-8dca-99725fdb46b6/manage-roles/remove',
    ])
    req.journeyData = {
      journeyCompleted: false,
      instanceUnixEpoch: Date.now(),
    }
    req.originalUrl = '/key-worker/3e680f74-8986-42f9-8dca-99725fdb46b6/manage-roles/remove/confirmation'

    preventNavigationToExpiredJourneys()(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.redirect).not.toHaveBeenCalled()
  })

  it('should use homepage as fallback when history is invalid', () => {
    const res = createRes()
    res.locals.b64History = 'NOT A BASE64 HISTORY'
    req.journeyData = {
      journeyCompleted: true,
      instanceUnixEpoch: Date.now(),
    }
    req.originalUrl = '/key-worker/3e680f74-8986-42f9-8dca-99725fdb46b6/manage-roles/remove/page'

    preventNavigationToExpiredJourneys()(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(`/key-worker?history=${historyToBase64([], true)}`)
  })
})
