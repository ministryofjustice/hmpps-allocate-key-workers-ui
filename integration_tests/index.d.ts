declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to signIn. Set failOnStatusCode to false if you expect and non 200 return code
     * @example cy.signIn({ failOnStatusCode: boolean })
     */
    signIn(options?: { failOnStatusCode: boolean }): Chainable<string>
    verifyLastAPICall(matching: string | object, expected: object): Chainable<unknown>
    injectJourneyDataAndReload<T>(uuid: string, json: T, policy?: string): void
    /** Make a POST request to the given URL with the given body - automatically picks up the CSRF token from the current page */
    postWithCsrf(options: { body: object; url: string }): Cypress.Chainable<Cypress.Response<unknown>>
    /** Verify that a POST request to the given URL with the given body results in a not authorised redirect */
    verifyPostRedirectsToNotAuthorised(options: { body: object; url?: string }): Cypress.Chainable<number>
    verifyAuditEvents(events: object[]): Chainable<unknown>
  }
}
