context('test errorHandler', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
    cy.task('stubPrisonNoHighRisk')
  })

  // TODO: add test for API error handling
  it.skip('should go to the custom error page when an API 500s', () => {
    cy.task('stubAPI500Error')
    cy.signIn()
    cy.visit(`/path-that-requires-API-call`, { failOnStatusCode: false })
    cy.findByText(/sorry, there is a problem with the service/i).should('be.visible')
  })

  it('should say page not found when 404', () => {
    cy.signIn()
    cy.visit(`/foobar`, { failOnStatusCode: false })
    cy.findByRole('heading', { name: /Page not found/i }).should('be.visible')
  })
})
