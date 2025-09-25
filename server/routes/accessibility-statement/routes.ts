import { JourneyRouter } from '../base/routes'
import { Page } from '../../services/auditService'
import { AccessibilityStatementController } from './controller'

export const AccessibilityStatementRoutes = () => {
  const { router, get } = JourneyRouter()
  const controller = new AccessibilityStatementController()

  get('/', Page.ACCESSIBILITY_STATEMENT, controller.GET)

  return router
}
