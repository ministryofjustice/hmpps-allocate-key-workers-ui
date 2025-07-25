import type { Request, Response, NextFunction, RequestHandler } from 'express'
import { sentenceCase } from '../utils/formatUtils'

export type Breadcrumb = { href: string } & ({ text: string } | { html: string })

export class Breadcrumbs {
  breadcrumbs: Breadcrumb[]

  constructor(res: Response) {
    this.breadcrumbs = [
      {
        text: 'Digital Prison Services',
        href: res.locals.digitalPrisonServicesUrl,
      },
      {
        text: `${sentenceCase(res.locals.policyStaff!)}s`,
        href: `/${res.locals.policyPath}`,
      },
    ]
  }

  popLastItem(): Breadcrumb | undefined {
    return this.breadcrumbs.pop()
  }

  addItems(...items: Breadcrumb[]): void {
    this.breadcrumbs.push(...items)
  }

  get items(): readonly Breadcrumb[] {
    return [...this.breadcrumbs]
  }
}

export default function breadcrumbs(): RequestHandler {
  return (_req: Request, res: Response, next: NextFunction): void => {
    res.locals.breadcrumbs = new Breadcrumbs(res)
    next()
  }
}
