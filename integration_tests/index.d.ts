declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to signIn. Set failOnStatusCode to false if you expect and non 200 return code
     * @example cy.signIn({ failOnStatusCode: boolean })
     */
    signIn(options?: { failOnStatusCode: boolean }): Chainable<string>
    verifyLastAPICall(matching: string | object, expected: object): Chainable<unknown>
    injectJourneyDataAndReload<T>(uuid: string, json: T, policy?: string): void
  }
}
