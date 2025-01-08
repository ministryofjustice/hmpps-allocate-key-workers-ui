import { RequestHandler } from 'express'
import logger from '../../logger'
import { dataAccess } from '../data'

export default function populateClientToken(): RequestHandler {
  const { hmppsAuthClient } = dataAccess()

  return async (req, res, next) => {
    try {
      if (res.locals.user) {
        const systemClientToken = await hmppsAuthClient.getSystemClientToken(res.locals.user.username)
        if (systemClientToken) {
          req.systemClientToken = systemClientToken
        } else {
          logger.info('No client token available')
        }
      }
      next()
    } catch (error) {
      logger.error(error, `Failed to retrieve client token for: ${res.locals.user && res.locals.user.username}`)
      next(error)
    }
  }
}
