import express, { Express } from 'express'
import dpsComponents from '@ministryofjustice/hmpps-connect-dps-components'

import { randomUUID } from 'crypto'
import logger from '../../../logger'
import config from '../../config'
import routes from '../index'
import nunjucksSetup from '../../utils/nunjucksSetup'
import errorHandler from '../../errorHandler'
import type { Services } from '../../services'
import AuditService from '../../services/auditService'
import { HmppsUser } from '../../interfaces/hmppsUser'
import setUpWebSession from '../../middleware/setUpWebSession'
import { HmppsAuditClient } from '../../data'

jest.mock('../../services/auditService')

export const user: HmppsUser = {
  name: 'FIRST LAST',
  userId: 'id',
  token: 'token',
  username: 'user1',
  displayName: 'First Last',
  authSource: 'nomis',
  staffId: 1234,
  userRoles: [],
  caseloads: [],
}

export const flashProvider = jest.fn()

function appSetup(services: Services, production: boolean, userSupplier: () => HmppsUser): Express {
  const app = express()

  app.set('view engine', 'njk')

  nunjucksSetup(app)
  app.use(setUpWebSession())
  app.use((req, res, next) => {
    req.user = userSupplier() as Express.User
    req.flash = flashProvider
    res.locals = {
      ...res.locals,
      user: { ...req.user } as HmppsUser,
    }
    next()
  })
  app.use((req, _res, next) => {
    req.id = randomUUID()
    next()
  })
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.get(
    '*',
    dpsComponents.getPageComponents({
      logger,
      includeMeta: true,
      dpsUrl: config.serviceUrls.digitalPrison,
      timeoutOptions: { response: 50, deadline: 50 },
    }),
  )
  app.use((_req, res, next) => {
    res.notFound = () => res.status(404).render('pages/not-found')
    next()
  })
  app.use(routes(services))
  app.use((_req, res) => res.notFound())
  app.use(errorHandler(production))

  return app
}

export function appWithAllRoutes({
  production = false,
  services = {
    auditService: new AuditService(
      new HmppsAuditClient({
        enabled: false,
        queueUrl: '',
        region: '',
        serviceName: '',
      }),
    ) as jest.Mocked<AuditService>,
  },
  userSupplier = () => user,
}: {
  production?: boolean
  services?: Partial<Services>
  userSupplier?: () => HmppsUser
}): Express {
  return appSetup(services as Services, production, userSupplier)
}
