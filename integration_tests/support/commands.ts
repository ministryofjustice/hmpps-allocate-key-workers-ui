import { getLastAPICallMatching } from '../mockApis/wiremock'
import { JourneyData } from '../../server/@types/express'

type RecursivePartial<T> = T extends unknown
  ? T extends object
    ? { [K in keyof T]?: RecursivePartial<T[K]> }
    : T
  : never

export type PartialJourneyData = RecursivePartial<JourneyData>

Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.request('/key-worker')
  return cy.task<string>('getSignInUrl').then((url: string) => {
    cy.visit(url, options)
  })
})

Cypress.Commands.add('verifyLastAPICall', (matching: string | object, expected: object) => {
  return cy.wrap(getLastAPICallMatching(matching)).should('deep.equal', expected)
})

Cypress.Commands.add('injectJourneyDataAndReload', <T>(uuid: string, json: T, policy: string = 'key-worker') => {
  const data = encodeURIComponent(btoa(JSON.stringify(json)))
  cy.request('GET', `${policy}/${uuid}/inject-journey-data?data=${data}`)
  cy.reload()
})
