import { getLastAPICallMatching } from '../mockApis/wiremock'

Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.request('/')
  return cy.task<string>('getSignInUrl').then((url: string) => {
    cy.visit(url, options)
  })
})

Cypress.Commands.add('verifyLastAPICall', (matching: string | object, expected: object) => {
  return cy.wrap(getLastAPICallMatching(matching)).should('deep.equal', expected)
})
