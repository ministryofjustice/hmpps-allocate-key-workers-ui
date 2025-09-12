import type { NextFunction, Request, Response } from 'express'
import { v4 as uuidV4, validate } from 'uuid'

export default function insertJourneyIdentifier() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const uuid = req.url.split('/')[1]
    if (!validate(uuid)) {
      const basePaths = req.baseUrl.split('/')
      return res.redirect(`${[...basePaths.slice(0, -1), uuidV4(), ...basePaths.slice(-1)].join('/')}${req.url}`)
    }
    return next()
  }
}
