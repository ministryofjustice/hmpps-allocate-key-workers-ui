import { Request, RequestHandler, Response } from 'express'
import { sentenceCase } from '../utils/formatUtils'
import { Breadcrumbs, type Breadcrumb } from './breadcrumbs'
import { Page } from '../services/auditService'

export function deserialiseHistory(b64String: string = ''): string[] {
  try {
    return JSON.parse(Buffer.from(b64String || '', 'base64').toString() || '[]')
  } catch {
    return []
  }
}

function serialiseHistory(history: string[]) {
  return Buffer.from(JSON.stringify(history)).toString('base64')
}

export function restoreHistoryFromJourneyData(req: Request, res: Response) {
  const history = deserialiseHistory(req.journeyData.b64History)
  res.locals.history = history
  res.locals.b64History = req.journeyData.b64History!

  res.locals.breadcrumbs = new Breadcrumbs(res)
  res.locals.breadcrumbs.addItems(...getBreadcrumbs(req, res))
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

export function historyMiddleware(...excludeUrls: RegExp[]): RequestHandler {
  return (req, res, next) => {
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
      return res.redirect(`${req.originalUrl.split('?')[0]}?${str}`)
    }

    const history = pruneHistory(req.originalUrl, queryHistory)
    history.push(noHistoryParam(req.originalUrl))

    res.locals.history = history
    res.locals.b64History = serialiseHistory(history)

    res.locals.historyBackUrl =
      getLastDifferentPage(req, res) || req.headers?.['referer'] || `/${res.locals.policyPath || ''}`

    res.locals.breadcrumbs = new Breadcrumbs(res)
    res.locals.breadcrumbs.addItems(...getBreadcrumbs(req, res))

    return next()
  }
}

function pruneHistory(url: string, history: string[]) {
  const deduplicatedHistory = removeDuplicateConsecutiveUrls(history)
  const historyBefore = getHistoryBefore(deduplicatedHistory, url)
  const targetUrlNoQuery = url.split('?')[0]
  const lastIndex = historyBefore.findLastIndex(o => o.split('?')[0] === targetUrlNoQuery)
  if (lastIndex === -1 || lastIndex === historyBefore.length - 1) return historyBefore
  return historyBefore.slice(0, lastIndex + 1)
}

function removeDuplicateConsecutiveUrls(history: string[]) {
  const historyWithoutDuplicates: string[] = []
  for (let i = 0; i < history.length; i += 1) {
    if (i === 0 || (history[i] !== history[i - 1] && history[i])) {
      historyWithoutDuplicates.push(history[i]!)
    }
  }
  return historyWithoutDuplicates
}

export function getBreadcrumbs(req: Request, res: Response) {
  const URL_MAPPINGS: { matcher: RegExp; text: string; alias: string }[] = [
    {
      matcher: new RegExp(`^/${res.locals.policyPath}([^/]|$)`, 'i'),
      text: sentenceCase(res.locals.policyStaffs!, true),
      alias: Page.HOMEPAGE,
    },
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

  const breadcrumbs: Breadcrumb[] = []

  const itemsToAdd = new Map<string, Breadcrumb>()

  for (const [i, url] of (res.locals.history || []).entries()) {
    const matched = URL_MAPPINGS.find(mapping => noHistoryParam(url).match(mapping.matcher))
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

function getHistoryBefore(history: string[], url: string) {
  const urlNoHistory = url.split('?')[0]
  const newHistory = [...history]
  for (let i = history.length - 1; i >= 0; i -= 1) {
    if (history[i]!.split('?')[0] === urlNoHistory) {
      newHistory.splice(i, 1)
    } else {
      break
    }
  }

  return newHistory
}

export function getLastDifferentPage(req: Request, res: Response) {
  if (!res.locals.history) return ''
  return [...res.locals.history].reverse().find(url => url.split('?')[0] !== req.originalUrl.split('?')[0])
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

export function createBackUrlFor(b64History: string, matcher: RegExp, fallback: string) {
  const history = deserialiseHistory(b64History)
  const last = history.findLast(o => matcher.test(o)) || fallback
  const prunedHistory = pruneHistory(last, history)
  const searchParams = new URLSearchParams(last.split('?')[1] || '')
  searchParams.set('history', serialiseHistory(prunedHistory))
  return `${last.split('?')[0]}?${searchParams.toString()}`
}

export function getLastNonJourneyPage(b64History: string, fallbackUrl: string) {
  const nonJourneyPageMatcher =
    /^\/[A-Za-z-]+\/(?![0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/
  return createBackUrlFor(b64History, nonJourneyPageMatcher, fallbackUrl)
}
