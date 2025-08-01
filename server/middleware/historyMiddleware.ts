import { Request, RequestHandler } from 'express'

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

    res.locals.historyBackUrl = getLastDifferentPage(req) || req.headers?.['referer'] || '/'
    return next()
  }
}

function pruneHistory(req: Request) {
  const targetUrlNoQuery = req.originalUrl.split('?')[0]
  const lastIndex = req.session.history!.findLastIndex(url => url.split('?')[0] === targetUrlNoQuery)
  if (lastIndex === -1) return
  req.session.history = req.session.history!.slice(0, lastIndex + 1)
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
