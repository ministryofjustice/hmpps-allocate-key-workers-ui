/* eslint-disable no-param-reassign */
import path from 'path'
import nunjucks from 'nunjucks'
import express from 'express'
import fs from 'fs'
import { initialiseName, policyAware, policyString } from './utils'
import config from '../config'
import logger from '../../logger'
import {
  formatDateConcise,
  formatDateTime,
  getDateInReadableFormat,
  todayStringGBFormat,
  yesterdayStringGBFormat,
} from './datetimeUtils'
import { buildErrorSummaryList, customErrorOrderBuilder, findError } from '../middleware/validationMiddleware'
import {
  alertsSortValue,
  firstNameSpaceLastName,
  lastNameCommaFirstName,
  nameCase,
  possessiveComma,
  sentenceCase,
} from './formatUtils'
import {
  addSelectValue,
  conditionallyAddDeallocate,
  excludeCurrentStaffMember,
  mergePrisonerKeyworkerIds,
  setCheckedValue,
  setSelectedValue,
} from './dropdownUtils'
import { formatValue, getHighlightedStatChange, getStatChange } from './statsUtils'
import { hasPermission } from '../middleware/permissionsMiddleware'

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
  njkEnv.addFilter('addSelectValue', addSelectValue)
  njkEnv.addFilter('setSelectedValue', setSelectedValue)
  njkEnv.addFilter('setCheckedValue', setCheckedValue)
  njkEnv.addFilter('nameCase', nameCase)
  njkEnv.addFilter('sentenceCase', sentenceCase)
  njkEnv.addFilter('formatValue', formatValue)
  njkEnv.addFilter('getStatChange', getStatChange)
  njkEnv.addFilter('firstNameSpaceLastName', firstNameSpaceLastName)
  njkEnv.addFilter('formatDateConcise', formatDateConcise)
  njkEnv.addFilter('excludeCurrentStaffMember', excludeCurrentStaffMember)
  njkEnv.addFilter('formatDateTime', formatDateTime)
  njkEnv.addFilter('mergePrisonerKeyworkerIds', mergePrisonerKeyworkerIds)
  njkEnv.addFilter('conditionallyAddDeallocate', conditionallyAddDeallocate)
  njkEnv.addFilter('buildErrorSummaryList', buildErrorSummaryList)
  njkEnv.addFilter('customErrorOrderBuilder', customErrorOrderBuilder)
  njkEnv.addFilter('removeNullish', arr => arr.filter((o: unknown) => o !== undefined && o !== null))
  njkEnv.addFilter('mapProperty', (arr: { [key: string]: object }[], property: string) => arr.map(itm => itm[property]))
  njkEnv.addFilter('getHighlightedStatChange', getHighlightedStatChange)
  njkEnv.addFilter('hasPermission', hasPermission)
  njkEnv.addGlobal('yesterdayStringGBFormat', yesterdayStringGBFormat)
  njkEnv.addFilter('policyAware', policyAware)
  njkEnv.addFilter('alertsSortValue', alertsSortValue)
  njkEnv.addFilter('takeFirstWord', (val: string) => val.split(' ')[0])
  njkEnv.addFilter('possessiveComma', possessiveComma)
  njkEnv.addFilter('policyString', policyString)
}
