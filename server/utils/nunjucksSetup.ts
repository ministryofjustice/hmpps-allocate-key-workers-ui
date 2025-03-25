/* eslint-disable no-param-reassign */
import path from 'path'
import nunjucks from 'nunjucks'
import express from 'express'
import fs from 'fs'
import { initialiseName } from './utils'
import config from '../config'
import logger from '../../logger'
import { todayStringGBFormat } from './datetimeUtils'
import { findError } from '../middleware/validationMiddleware'
import { lastNameCommaFirstName, nameCase } from './formatUtils'
import { addDefaultSelectedValue, setSelectedValue } from './dropdownUtils'
import { formatValue, getStatChange } from './statsUtils'

export default function nunjucksSetup(app: express.Express): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'HMPPS Allocate Key Workers Ui'
  app.locals.environmentName = config.environmentName
  app.locals.environmentNameColour = config.environmentName === 'PRE-PRODUCTION' ? 'govuk-tag--green' : ''
  let assetManifest: Record<string, string> = {}

  try {
    const assetMetadataPath = path.resolve(__dirname, '../../assets/manifest.json')
    assetManifest = JSON.parse(fs.readFileSync(assetMetadataPath, 'utf8'))
  } catch (e) {
    if (process.env.NODE_ENV !== 'test') {
      logger.error(e, 'Could not read asset manifest file')
    }
  }

  app.use((_req, res, next) => {
    res.locals.digitalPrisonServicesUrl = config.serviceUrls.digitalPrison
    res.locals.legacyKeyWorkersUiUrl = config.serviceUrls.legacyKeyWorkersUI
    res.locals['prisonerProfileUrl'] = config.serviceUrls.prisonerProfile
    return next()
  })

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      path.join(__dirname, '../../server/routes/journeys'),
      path.join(__dirname, '../../server/routes'),
      'node_modules/govuk-frontend/dist/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/hmpps-connect-dps-components/dist/assets/',
    ],
    {
      autoescape: true,
      express: app,
    },
  )

  njkEnv.addFilter('findError', findError)
  njkEnv.addGlobal('todayStringGBFormat', todayStringGBFormat)
  njkEnv.addFilter('initialiseName', initialiseName)
  njkEnv.addFilter('assetMap', (url: string) => assetManifest[url] || url)
  njkEnv.addFilter('dateString', getDateInReadableFormat)
  njkEnv.addFilter('lastNameCommaFirstName', lastNameCommaFirstName)
  njkEnv.addFilter('addDefaultSelectedValue', addDefaultSelectedValue)
  njkEnv.addFilter('setSelectedValue', setSelectedValue)
  njkEnv.addFilter('nameCase', nameCase)
  njkEnv.addFilter('formatValue', formatValue)
  njkEnv.addFilter('getStatChange', getStatChange)
}

export function getDateInReadableFormat(dateString: string) {
  const split = dateString?.split(/-|\//) || []
  if (split.length < 3) throw new Error(`Invalid date string: ${dateString}`)
  if (split[0]?.length === 4) {
    const date = new Date(dateString)
    return `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`
  }
  const date = new Date(parseInt(split[2]!, 10), parseInt(split[1]!, 10) - 1, parseInt(split[0]!, 10))
  return `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`
}
