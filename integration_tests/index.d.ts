declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to signIn. Set failOnStatusCode to false if you expect and non 200 return code
     * @example cy.signIn({ failOnStatusCode: boolean })
     */
    signIn(options?: { failOnStatusCode: boolean }): Chainable<string>
    verifyLastAPICall(matching: string | object, expected: unknown): Chainable<unknown>
    injectJourneyDataAndReload<T>(uuid: string, json: T, policy?: string): void
    /** Make a POST request to the given URL with the given body - automatically picks up the CSRF token from the current page */
    postWithCsrf(options: { body: object; url: string }): Cypress.Chainable<Cypress.Response<unknown>>
    /** Verify that a POST request to the given URL with the given body results in a not authorised redirect */
    verifyPostRedirectsToNotAuthorised(options: { body: object; url?: string }): Cypress.Chainable<number>
    verifyAuditEvents(events: object[]): Chainable<unknown>
    /**
     * Custom command to verify that an API matching the parameter was called the expected number of times.
     * @param matching a wiremock request to /requests/find. For options see: https://wiremock.org/docs/standalone/admin-api-reference/#tag/Requests/operation/removeRequestsByMetadata
     * @param expected the number of requests expected
     */
    verifyAPIWasCalled(matching: string | object, expected: number): Chainable<*>
    shouldContainHistoryParam(history: (string | RegExp)[]): Chainable<Subject>
    visitWithHistory(url: string, history: string[]): Chainable<unknown>
  }
}
