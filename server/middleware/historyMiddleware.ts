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

    const queryHistory: string[] = JSON.parse(req.query['history'] as string || '[]')
    const searchParams = new URLSearchParams(req.originalUrl.split('?')[1] || '')
    if (!queryHistory.length) {
      const refererStr = req.headers?.['referer'] as string || ''
      const refererSearchParams = new URLSearchParams(refererStr.split('?')[1] || '')
      const refererHistory = JSON.parse(refererSearchParams.get('history') as string || '[]')
      searchParams.set('history', JSON.stringify([...refererHistory, req.originalUrl]))
      const str = searchParams.toString()
      return res.redirect(req.originalUrl.split('?')[0] + '?' + str)
    }

    console.log(`BEFORE PRUNE HISTORY ${queryHistory.join(', ')}`)
    const { modified, history } = pruneHistory(req.originalUrl, queryHistory.slice(0, -1))
    console.log(`AFTER PRUNE HISTORY ${history.join(', ')}`)

    if (modified) {
      console.log(`PRUNE HAPPENED - REDIRECTING`)
      searchParams.set('history', JSON.stringify(history))
      return res.redirect(req.originalUrl.split('?')[0] + '?' + searchParams.toString())
    }

    if (!excludeUrls.some(itm => itm.test(req.originalUrl))) {
      history.push(req.originalUrl)
    }

    res.locals.history = history

    res.locals.historyBackUrl =
      getLastDifferentPage(req, res) || req.headers?.['referer'] || `/${res.locals.policyPath || ''}`

    const breadcrumbs = getBreadcrumbs(req, res)
    console.log(JSON.stringify(breadcrumbs.items, null, 2))
    console.log(`URL LENGTH IS ${req.originalUrl.length}`)
    return next()
  }
}

function pruneHistory(url: string, history: string[]) {
  const targetUrlNoQuery = url.split('?')[0]
  const lastIndex = history.findLastIndex(url => url.split('?')[0] === targetUrlNoQuery)
  if (lastIndex === -1 || lastIndex === history.length - 1) return { modified: false, history }
  return { modified: true, history: history.slice(0, lastIndex + 1) }
}

export function getBreadcrumbs(req: Request, res: Response) {
  const breadcrumbs = new Breadcrumbs(res)

  const itemsToAdd = new Map<string, string>()

  for (const url of res.locals.history || []) {
    const urlSearchParams = new URLSearchParams(url.split('?')[1] || '')
    urlSearchParams.delete('history')
    const urlNoHistory = url.split('?')[0] + '?' + urlSearchParams.toString()
    const matched = URL_MAPPINGS.find(mapping => urlNoHistory.match(mapping.matcher))
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

export function getLast(res: Response) {
  return res.locals.history?.[res.locals.history.length - 2]
}

function getLastDifferentPageInner(req: Request, history: string[]) {
  if (!history) return ''
  return [...history].reverse().find(url => url.split('?')[0] !== req.originalUrl.split('?')[0])
}

export function getLastDifferentPage(req: Request, res: Response) {
  if (!res.locals.history) return ''
  return [...res.locals.history].reverse().find(url => url.split('?')[0] !== req.originalUrl.split('?')[0])
}

export function getLastDifferentPageNotMatching(req: Request, res: Response, urlRegex: RegExp) {
  if (!res.locals.history) return ''
  return [...res.locals.history]
    .reverse()
    .find(url => !urlRegex.test(url) && url.split('?')[0] !== req.originalUrl.split('?')[0])
}
