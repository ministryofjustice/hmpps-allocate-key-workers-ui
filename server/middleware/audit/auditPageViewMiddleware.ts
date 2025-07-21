import { Request, Response, NextFunction } from 'express'
import AuditService from '../../services/auditService'

export const auditPageViewMiddleware =
  (auditService: AuditService) => async (req: Request, res: Response, next: NextFunction) => {
    // initialise audit event details
    res.locals.auditEvent = {
      who: res.locals.user.username,
      correlationId: req.id,
      subjectType: 'NOT_APPLICABLE',
      details: {
        pageUrl: req.originalUrl,
      },
    }

    // function to collect audit event details at the end of the call
    res.getPageViewEvent = (isAttempt: boolean) => ({
      ...res.locals.auditEvent,
      details: {
        ...res.locals?.auditEvent?.details,
        activeCaseLoadId: res.locals.user.getActiveCaseloadId(),
        ...(req.middleware?.policy ? { policy: req.middleware.policy } : {}),
      },
      what: isAttempt ? 'PAGE_VIEW_ACCESS_ATTEMPT' : 'PAGE_VIEW',
    })

    // util functions to update audit event details in the Request handlers
    res.setAuditDetails = {
      prisonNumber: (prisonNumber: string) => {
        res.locals.auditEvent.subjectType = 'PRISONER_ID'
        res.locals.auditEvent.subjectId = prisonNumber
      },
      searchTerm: (searchTerm: string) => {
        res.locals.auditEvent.subjectType = 'SEARCH_TERM'
        res.locals.auditEvent.subjectId = searchTerm.trim().substring(0, 80)
        res.locals.auditEvent.details!.query = searchTerm.trim()
      },
      staffId: (staffId: number | string) => {
        res.locals.auditEvent.details!.staffId = String(staffId)
      },
    }

    // Send page view attempt event when the request closes
    res.prependOnceListener('close', () => {
      auditService.logAuditEvent(res.getPageViewEvent(true))
    })

    // Send page view event when a page view is rendered
    const resRender = res.render as (
      view: string,
      options?: object,
      callback?: (err: Error, html: string) => void,
    ) => void
    res.render = (view: string, options?) => {
      resRender.call(res, view, options, (err: Error, html: string) => {
        if (err) {
          res.status(500).send(err)
          return
        }
        if (res.statusCode === 200) {
          auditService.logAuditEvent(res.getPageViewEvent(false))
        }
        res.send(html)
      })
    }
    next()
  }
