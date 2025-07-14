import { Request, Response, NextFunction } from 'express'
import AuditService from '../../services/auditService'

export const auditApiCallMiddleware =
  (auditService: AuditService) => async (req: Request, res: Response, next: NextFunction) => {
    res.sendApiEvent = async (apiUrl: string, isAttempt: boolean) => {
      await auditService.logAuditEvent({
        what: isAttempt ? 'API_CALL_ATTEMPT' : 'API_CALL_SUCCESS',
        who: res.locals.user.username,
        correlationId: req.id,
        subjectType: 'NOT_APPLICABLE',
        details: {
          apiUrl,
          activeCaseLoadId: res.locals.user.getActiveCaseloadId(),
          ...(req.middleware?.policy ? { policy: req.middleware.policy } : {}),
        },
      })
    }

    next()
  }
