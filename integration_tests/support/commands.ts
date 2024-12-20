Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.request('/')
  return cy.task<string>('getSignInUrl').then((url: string) => {
    cy.visit(url, options)
  })
})
