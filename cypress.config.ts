import { defineConfig } from 'cypress'
import coverageTask from '@cypress/code-coverage/task'
import { GenerateCtrfReport } from 'cypress-ctrf-json-reporter'
import { gunzipSync, gzipSync } from 'zlib'
import { resetStubs } from './integration_tests/mockApis/wiremock'
import auth from './integration_tests/mockApis/auth'
import tokenVerification from './integration_tests/mockApis/tokenVerification'
import prisonApi from './integration_tests/mockApis/prisonApi'
import componentsApi from './integration_tests/mockApis/componentsApi'
import keyworkerApi from './integration_tests/mockApis/keyworkerApi'
import locationsApi from './integration_tests/mockApis/locationsApi'
import prisonerSearchApi from './integration_tests/mockApis/prisonerSearchApi'
import logAccessibilityViolations from './integration_tests/support/accessibilityViolations'

export default defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'integration_tests/fixtures',
  screenshotsFolder: 'integration_tests/screenshots',
  videosFolder: 'integration_tests/videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  taskTimeout: 60000,
  e2e: {
    setupNodeEvents(on, config) {
      coverageTask(on, config)
      on('task', {
        reset: resetStubs,
        ...auth,
        ...tokenVerification,
        ...keyworkerApi,
        ...prisonApi,
        ...componentsApi,
        ...locationsApi,
        ...prisonerSearchApi,
        ...logAccessibilityViolations,
        gzipCompress: text => {
          const buffer = Buffer.from(text, 'utf-8')
          const compressed = gzipSync(buffer)
          return compressed.toString('base64')
        },
        gzipDecompress: text => {
          const buffer = Buffer.from(text, 'base64')
          const decompressed = gunzipSync(buffer)
          return decompressed.toString('utf-8')
        },
      })
      // eslint-disable-next-line no-new
      new GenerateCtrfReport({
        on,
      })
      return config
    },
    baseUrl: 'http://localhost:3007',
    excludeSpecPattern: ['dist', '**/!(*.cy).ts'],
    specPattern: '**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
    experimentalRunAllSpecs: true,
    env: {
      codeCoverage: {
        url: 'http://localhost:3007/__coverage__',
      },
    },
    retries: {
      runMode: 2,
    },
    viewportHeight: 1200,
    viewportWidth: 1280,
  },
})
