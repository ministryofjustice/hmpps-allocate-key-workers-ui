import { NextFunction, Request, RequestHandler, Response } from 'express'
import { gzipSync, unzipSync } from 'node:zlib'
import { sentenceCase } from '../utils/formatUtils'
import { Breadcrumbs, type Breadcrumb } from './breadcrumbs'
import { Page } from '../services/auditService'

type Landmark = {
  matcher: RegExp
  text: string
  alias: string
}

function getLandmarks(res: Response): Landmark[] {
  return [
    { matcher: /\/allocate/g, text: `Allocate ${res.locals.policyStaffs!}`, alias: Page.ALLOCATE },
    {
      matcher: /recommend-allocations/g,
      text: `Allocate ${res.locals.policyStaffs!} automatically`,
      alias: Page.RECOMMENDED_ALLOCATIONS,
    },
    {
      matcher: /prisoner-allocation-history/g,
      text: 'Prisoner allocation history',
      alias: Page.PRISONER_ALLOCATION_HISTORY,
    },
    { matcher: /\/manage([^-]|$)/g, text: `Manage ${res.locals.policyStaffs!}`, alias: Page.MANAGE_ALLOCATABLE_STAFF },
    { matcher: /\/manage-roles([^/]|$)/g, text: `Manage roles`, alias: Page.MANAGE_ROLES },
    {
      matcher: /\/staff-profile/g,
      text: `${sentenceCase(res.locals.policyStaff!)} profile`,
      alias: Page.STAFF_PROFILE,
    },
  ]
}

function replaceResRedirect(req: Request, res: Response, history: string[]) {
  const originalRedirect = res.redirect
  res.redirect = (param1: string | number, param2?: string | number) => {
    const url = (typeof param1 === 'string' ? param1 : param2) as string
    // eslint-disable-next-line no-nested-ternary
    const status = typeof param1 === 'number' ? param1 : typeof param2 === 'number' ? param2 : undefined

    const baseUrl = `${req.protocol}://${req.get('host')}`
    const builtUrl = new URL(url, `${baseUrl}${req.originalUrl}`)
    const prunedHistory = pruneHistory(builtUrl.pathname + builtUrl.search, history)
    prunedHistory.push(noHistoryParam(builtUrl.pathname + builtUrl.search))
    builtUrl.searchParams.set('history', serialiseHistory(prunedHistory))

    return originalRedirect.call(res, status || 302, builtUrl.toString())
  }
}

function handlePOSTRedirect(req: Request, res: Response, next: NextFunction) {
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

export function historyMiddleware(...excludeUrls: RegExp[]): RequestHandler {
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

function serialiseHistory(history: string[]) {
  return compressSync(JSON.stringify(history))
}

export function getHistoryParamForPOST(
  req: Request,
  targetPage?: string,
  newSearchParams: URLSearchParams = new URLSearchParams(),
) {
  const refererHistory = getHistoryFromReferer(req)
  if (targetPage) {
    const refererUrl = new URL(req.headers['referer'] || `http://0.0.0.0${req.originalUrl}`)
    const history = pruneHistory(refererUrl.pathname, refererHistory)
    const destUrl = `${targetPage}?${newSearchParams.toString()}`.replace(/\?$/g, '')
    history.push(destUrl)
    return serialiseHistory(history)
  }
  refererHistory.push(noHistoryParam(req.originalUrl))
  const history = pruneHistory(req.originalUrl, refererHistory)
  return serialiseHistory(history)
}

function pruneHistory(url: string, history: string[]) {
  const targetUrlNoQuery = url.split('?')[0]!
  const lastIndex = history.slice(0, history.length - 1).findLastIndex(o => o.split('?')[0] === targetUrlNoQuery)
  if (lastIndex === -1 || lastIndex === history.length - 1) return history

  return [...history.slice(0, lastIndex), noHistoryParam(url)]
}

export function getBreadcrumbs(req: Request, res: Response) {
  const breadcrumbs: Breadcrumb[] = []

  const itemsToAdd = new Map<string, Breadcrumb>()

  for (const [i, url] of (res.locals.history?.slice(0, res.locals.history.length - 1) || []).entries()) {
    const matched = getLandmarks(res).find(mapping => url.split('?')[0]!.match(mapping.matcher))
    if (matched) {
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
    if (noHistoryParam(breadcrumb.href) !== noHistoryParam(req.originalUrl)) {
      breadcrumbs.push(breadcrumb)
    }
  }

  return breadcrumbs
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
