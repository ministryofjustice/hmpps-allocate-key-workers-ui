import { Request, RequestHandler, Response } from 'express'
import { Breadcrumbs } from './breadcrumbs'

const URL_MAPPINGS: { matcher: RegExp, backAlias: string, breadcrumbAlias: string }[] = [
  { matcher: /\/allocate/g, backAlias: 'allocate', breadcrumbAlias: 'Allocate' },
  { matcher: /recommend-allocations/g, backAlias: 'recommend allocations', breadcrumbAlias: 'Recommend allocations' },
  { matcher: /prisoner-allocation-history/g, backAlias: 'prisoner allocation history', breadcrumbAlias: 'Prisoner allocation history' },
  { matcher: /\/manage/g, backAlias: 'manage key workers', breadcrumbAlias: 'Manage [staff]' },
  { matcher: /\/staff-profile/g, backAlias: '[staff]\'s profile', breadcrumbAlias: 'Profile' },
]

export function historyMiddlware(...excludeUrls: RegExp[]): RequestHandler {
  return (req, res, next) => {
    if (req.method !== 'GET') {
      return next()
    }

    req.session.history ??= []
    pruneHistory(req)

    if (!excludeUrls.some(itm => itm.test(req.originalUrl))) {
      req.session.history.push(req.originalUrl)
    }

    res.locals.historyBackUrl =
      getLastDifferentPage(req) || req.headers?.['referer'] || `/${res.locals.policyPath || ''}`

    const breadcrumbs = getBreadcrumbs(req, res)
    console.log(JSON.stringify(breadcrumbs.items, null, 2))
    return next()
  }
}

function pruneHistory(req: Request) {
  const targetUrlNoQuery = req.originalUrl.split('?')[0]
  const lastIndex = req.session.history!.findLastIndex(url => url.split('?')[0] === targetUrlNoQuery)
  if (lastIndex === -1) return
  req.session.history = req.session.history!.slice(0, lastIndex + 1)
}

export function getBreadcrumbs(req: Request, res: Response) {
  const breadcrumbs = new Breadcrumbs(res)

  const itemsToAdd = new Map<string, string>()

  for (const url of req.session.history || []) {
    const matched = URL_MAPPINGS.find(mapping => url.match(mapping.matcher))
    if (matched) {
      itemsToAdd.set(matched.breadcrumbAlias, url)
    }
  }

  for (const [alias, url] of itemsToAdd.entries()) {
    if (url === req.originalUrl) continue
    breadcrumbs.addItems({
      text: alias.replaceAll('[staff]', res.locals.policyStaffs!),
      href: url,
    })
  }

  return breadcrumbs
}

export function getLast(req: Request) {
  return req.session.history?.[req.session.history.length - 2]
}

export function getLastDifferentPage(req: Request) {
  if (!req.session.history) return ''
  return [...req.session.history].reverse().find(url => url.split('?')[0] !== req.originalUrl.split('?')[0])
}

export function getLastDifferentPageNotMatching(req: Request, urlRegex: RegExp) {
  if (!req.session.history) return ''
  return [...req.session.history]
    .reverse()
    .find(url => !urlRegex.test(url) && url.split('?')[0] !== req.originalUrl.split('?')[0])
}
