import { Request, Response } from 'express'

export class AccessibilityStatementController {
  GET = async (_req: Request, res: Response): Promise<void> => {
    return res.render('accessibility-statement/view', {
      backUrl: 'javascript-back',
    })
  }
}
