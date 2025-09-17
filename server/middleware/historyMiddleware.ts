import { NextFunction, Request, RequestHandler, Response } from 'express'
import { gzipSync, unzipSync } from 'zlib'
import { Breadcrumbs, type Breadcrumb } from './breadcrumbs'

type Landmark = {
  matcher: RegExp
  text: string
  alias: string
}

function replaceResRedirect(req: Request, res: Response, history: string[]) {
  const originalRedirect = res.redirect
  res.redirect = (param1: string | number, param2?: string | number) => {
    const url = (typeof param1 === 'string' ? param1 : param2) as string
    const status = typeof param1 === 'number' ? param1 : 302

    const baseUrl = `${req.protocol}://${req.get('host')}`
    const builtUrl = new URL(url, `${baseUrl}${req.originalUrl}`)
    const prunedHistory = pruneHistory(builtUrl.pathname + builtUrl.search, history)
    prunedHistory.push(noHistoryParam(builtUrl.pathname + builtUrl.search))
    builtUrl.searchParams.set('history', serialiseHistory(prunedHistory))

    return originalRedirect.call(res, status, builtUrl.toString())
  }
}

export function historyMiddleware(
  getLandmarks: (req: Request, res: Response) => Landmark[],
  ...excludeUrls: RegExp[]
): RequestHandler {
  const handlePOSTRedirect = (req: Request, res: Response, next: NextFunction) => {
    // POSTs should have the history maintained in the referrer header
    // and optionally the originalUrl IF not POSTing to a custom location (ie, /filter)
    const url = new URL(req.headers['referer'] || `http://0.0.0.0${req.originalUrl}`)
    const history = deserialiseHistory(url.searchParams.get('history') as string)

    if (!history.length) {
      return next()
    }

    res.locals.history = history
    res.locals.b64History = url.searchParams.get('history') as string
    res.locals.breadcrumbs = new Breadcrumbs(res)
    res.locals.breadcrumbs.addItems(...getBreadcrumbs(req, res))

    replaceResRedirect(req, res, history)

    return next()
  }

  const getBreadcrumbs = (req: Request, res: Response) => {
    const breadcrumbs: Breadcrumb[] = []

    const itemsToAdd = new Map<string, Breadcrumb>()

    for (const [i, url] of (res.locals.history || []).entries()) {
      const urlNoQuery = url.split('?')[0]!
      const matched = getLandmarks(req, res).find(mapping => urlNoQuery.match(mapping.matcher))
      if (matched && !req.originalUrl.split('?')[0]!.match(matched.matcher)) {
        const historyUpUntil = res.locals.history!.slice(0, i + 1)
        const urlWithParams = new URLSearchParams(url.split('?')[1] || '')
        urlWithParams.set('history', serialiseHistory(historyUpUntil))
        itemsToAdd.set(matched.text, {
          alias: matched.alias,
          text: matched.text,
          href: `${url.split('?')[0]}?${urlWithParams.toString()}`,
        })
      }
    }

    for (const breadcrumb of itemsToAdd.values()) {
      breadcrumbs.push(breadcrumb)
    }

    return breadcrumbs
  }

  return (req, res, next) => {
    if (req.method === 'POST') {
      return handlePOSTRedirect(req, res, next)
    }

    if (req.method !== 'GET') {
      return next()
    }

    const shouldExcludeUrl = (url: string) => excludeUrls.some(itm => itm.test(url))

    const queryHistory: string[] = deserialiseHistory(req.query['history'] as string)

    if (shouldExcludeUrl(req.originalUrl)) {
      res.locals.history = queryHistory
      res.locals.b64History = serialiseHistory(queryHistory)
      res.locals.breadcrumbs = new Breadcrumbs(res)
      res.locals.breadcrumbs.addItems(...getBreadcrumbs(req, res))
      return next()
    }

    const searchParams = new URLSearchParams(req.originalUrl.split('?')[1] || '')

    if (!queryHistory.length) {
      const refererHistory = getHistoryFromReferer(req)
      const history = pruneHistory(req.originalUrl, refererHistory)
      history.push(noHistoryParam(req.originalUrl))

      res.locals.history = history

      searchParams.set('history', serialiseHistory(history))
      const str = searchParams.toString()

      if (req.originalUrl.toString().match(new RegExp(`^/${res.locals.policyPath}/?$`, 'i'))) {
        // If homepage don't bother redirecting
        res.locals.history = [`/${res.locals.policyPath}`]
        res.locals.b64History = serialiseHistory(history)

        res.locals.breadcrumbs = new Breadcrumbs(res)
        res.locals.breadcrumbs.addItems(...getBreadcrumbs(req, res))
        return next()
      }

      res.setAuditDetails.suppress(true)
      return res.redirect(`${req.originalUrl.split('?')[0]}?${str}`)
    }

    const history = pruneHistory(req.originalUrl, queryHistory)

    res.locals.history = history
    res.locals.b64History = serialiseHistory(history)

    res.locals.historyBackUrl =
      getLastDifferentPage(history) || req.headers?.['referer'] || `/${res.locals.policyPath || ''}`

    res.locals.breadcrumbs = new Breadcrumbs(res)
    res.locals.breadcrumbs.addItems(...getBreadcrumbs(req, res))

    replaceResRedirect(req, res, history)

    return next()
  }
}

function compressSync(text: string) {
  const buffer = Buffer.from(text, 'utf-8')
  const compressed = gzipSync(buffer)
  return compressed.toString('base64')
}

function decompressSync(base64: string) {
  const buffer = Buffer.from(base64, 'base64')
  const decompressed = unzipSync(buffer)
  return decompressed.toString('utf-8')
}

export function deserialiseHistory(b64String: string = ''): string[] {
  try {
    return JSON.parse(decompressSync(b64String || '') || '[]')
  } catch {
    return []
  }
}

export function serialiseHistory(history: string[]) {
  return compressSync(JSON.stringify(history))
}

function pruneHistory(url: string, history: string[]) {
  const dedupedHistory = deduplicateHistory(history)
  const targetUrlNoQuery = url.split('?')[0]!
  const lastIndex = dedupedHistory
    .slice(0, dedupedHistory.length - 1)
    .findLastIndex(o => o.split('?')[0] === targetUrlNoQuery)
  if (lastIndex === -1 || lastIndex === dedupedHistory.length - 1) return dedupedHistory

  return [...dedupedHistory.slice(0, lastIndex), noHistoryParam(url)]
}

function deduplicateHistory(history: string[]) {
  // De-duplicate consecutive history items without query params
  if (history.length < 2) return history

  const newHistory = []
  let comparer = history[history.length - 1]!
  newHistory.push(comparer)
  for (let i = history.length - 1; i >= 0; i -= 1) {
    const item = history[i]!
    if (item.split('?')[0] !== comparer.split('?')[0]) {
      newHistory.push(item)
      comparer = item
    }
  }
  return newHistory.reverse()
}

export function noHistoryParam(url: string) {
  const [baseUrl, query] = url.split('?')
  const noHistorySearchParams = new URLSearchParams(query)
  noHistorySearchParams.delete('history')
  return `${baseUrl}?${noHistorySearchParams.toString()}`.replace(/\?$/g, '')
}

export function getLastDifferentPage(history: string[]) {
  if (!history?.length) return ''
  return [...history].reverse().find(url => url.split('?')[0] !== history[history.length - 1]!.split('?')[0])
}

function getHistoryFromReferer(req: Request) {
  const refererStr = (req.headers?.['referer'] as string) || ''
  const refererSearchParams = new URLSearchParams(refererStr.split('?')[1] || '')
  const refererHistory = deserialiseHistory(refererSearchParams.get('history') as string)

  if (req.headers['referer']) {
    const refererUrl = new URL(req.headers['referer'])
    refererHistory.push(noHistoryParam(refererUrl.pathname + refererUrl.search))
  }

  return refererHistory
}

export function createBackUrlFor(res: Response, matcher: RegExp, fallback: string) {
  const history = deserialiseHistory(res.locals.b64History!)
  const last = history.findLast(o => matcher.test(o)) || fallback
  const prunedHistory = pruneHistory(last, history)
  const searchParams = new URLSearchParams(last.split('?')[1] || '')
  searchParams.set('history', serialiseHistory(prunedHistory))
  return `${last.split('?')[0]}?${searchParams.toString()}`
}

export function getLastNonJourneyPage(res: Response, fallbackUrl: string) {
  const nonJourneyPageMatcher =
    /^\/[A-Za-z-]+\/(?![0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/
  return createBackUrlFor(res, nonJourneyPageMatcher, fallbackUrl)
}
