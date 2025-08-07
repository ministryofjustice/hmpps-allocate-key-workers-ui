import { Request, RequestHandler, Response } from 'express'
import { Breadcrumbs } from './breadcrumbs'

const URL_MAPPINGS: { matcher: RegExp, backAlias: string, breadcrumbAlias: string }[] = [
  { matcher: /^\/personal-officer\/?$/g, backAlias: 'personal officer', breadcrumbAlias: 'Personal officer' },
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

    const queryHistory: string[] = JSON.parse(Buffer.from(req.query['history'] as string || '', 'base64').toString() || '[]')
    const searchParams = new URLSearchParams(req.originalUrl.split('?')[1] || '')

    if (!queryHistory.length) {
      const refererStr = req.headers?.['referer'] as string || ''
      const refererSearchParams = new URLSearchParams(refererStr.split('?')[1] || '')
      const refererHistory = JSON.parse(Buffer.from(refererSearchParams.get('history') as string || '', 'base64').toString() || '[]')
      const jointHistory = [...refererHistory, req.originalUrl]
      const history = pruneHistory(req.originalUrl, jointHistory)
      searchParams.set('history', Buffer.from(JSON.stringify(history)).toString('base64'))
      const str = searchParams.toString()
      return res.redirect(req.originalUrl.split('?')[0] + '?' + str)
    }

    console.log(`BEFORE PRUNE HISTORY ${queryHistory.join(', ')}`)
    const history = pruneHistory(req.originalUrl, queryHistory)
    console.log(`AFTER PRUNE HISTORY ${history.join(', ')}`)

    const prevHistory = history[history.length - 1]
    if (!excludeUrls.some(itm => itm.test(req.originalUrl)) && prevHistory !== getUrlWithoutHistoryParams(req.originalUrl)) {
      history.push(getUrlWithoutHistoryParams(req.originalUrl))
    }

    res.locals.history = history
    res.locals.b64History = Buffer.from(JSON.stringify(history)).toString('base64')

    res.locals.historyBackUrl =
      getLastDifferentPage(req, res) || req.headers?.['referer'] || `/${res.locals.policyPath || ''}`

    const breadcrumbs = getBreadcrumbs(req, res)
    console.log(JSON.stringify(breadcrumbs.items, null, 2))
    console.log(`URL LENGTH IS ${req.originalUrl.length}`)
    return next()
  }
}

function pruneHistory(url: string, history: string[]) {
  const historyBefore = [...getHistoryBefore(history, url), getUrlWithoutHistoryParams(url)]
  const targetUrlNoQuery = url.split('?')[0]
  const lastIndex = historyBefore.findLastIndex(url => url.split('?')[0] === targetUrlNoQuery)
  if (lastIndex === -1 || lastIndex === historyBefore.length - 1) return historyBefore
  return historyBefore.slice(0, lastIndex + 1)
}

export function getBreadcrumbs(req: Request, res: Response) {
  const breadcrumbs = new Breadcrumbs(res)

  const itemsToAdd = new Map<string, string>()

  for (const [i, url] of (res.locals.history || []).entries()) {
    const matched = URL_MAPPINGS.find(mapping => getUrlWithoutHistoryParams(url).match(mapping.matcher))
    if (matched) {
      const historyUpUntil = res.locals.history!.slice(0, i + 1)
      const urlWithParams = new URLSearchParams(url.split('?')[1] || '')
      urlWithParams.set('history', Buffer.from(JSON.stringify(historyUpUntil)).toString('base64'))
      itemsToAdd.set(matched.breadcrumbAlias, `${url.split('?')[0]}?${urlWithParams.toString()}`)
    }
  }

  for (const [alias, url] of itemsToAdd.entries()) {
    if (getUrlWithoutHistoryParams(url) === getUrlWithoutHistoryParams(req.originalUrl)) continue
    breadcrumbs.addItems({
      text: alias.replaceAll('[staff]', res.locals.policyStaffs!),
      href: url,
    })
  }

  return breadcrumbs
}

function getUrlWithoutHistoryParams(url: string) {
  const noHistoreySearchParams = new URLSearchParams(url.split('?')[1] || '')
  noHistoreySearchParams.delete('history')
  const noHistoryUrl = url.split('?')[0] + '?' + noHistoreySearchParams.toString()
  return noHistoryUrl.replace(/\?$/g, '')
}

export function getLast(res: Response) {
  return res.locals.history?.[res.locals.history.length - 2]
}

function getHistoryBefore(history: string[], url: string) {
  const urlNoHistory = getUrlWithoutHistoryParams(url)
  const newHistory = [...history]
  for (let i = history.length - 1; i >= 0; i--) {
    if (getUrlWithoutHistoryParams(history[i]!) === urlNoHistory) {
      newHistory.splice(i, 1)
      i--
    }
  }

  return newHistory
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
