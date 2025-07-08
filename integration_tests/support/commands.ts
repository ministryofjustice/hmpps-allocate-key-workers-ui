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

Cypress.Commands.add('postWithCsrf', ({ url, body }) => {
  cy.get('input[name="_csrf"]')
    .should('exist')
    .then($token => {
      const requestBody = {
        _csrf: $token.val(),
        ...body,
      }

      cy.request({
        failOnStatusCode: false,
        method: 'POST',
        url,
        form: true,
        body: requestBody,
      })
    })
})

Cypress.Commands.add('verifyPostRedirectsToNotAuthorised', ({ body, url }) => {
  cy.url().then(currentUrl => {
    cy.postWithCsrf({ url: url || currentUrl, body }).then(response => {
      expect(response.status).to.equal(403)
      expect(response.redirects![0]).to.contain('/not-authorised')
    })
  })
})

Cypress.Commands.add('verifyRoleBasedAccess', ({ userRoles, hasJobResponsibility, url }) => {
  cy.task('stubSignIn', {
    roles: userRoles,
    hasAllocationJobResponsibilities: hasJobResponsibility,
  })

  cy.signIn({ failOnStatusCode: false })
  cy.visit(url, { failOnStatusCode: false })

  cy.url().should('to.match', /\/key-worker\/not-authorised/)
})
