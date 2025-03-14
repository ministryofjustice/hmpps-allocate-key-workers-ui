context('Profile Info', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
  })

  it('should show profile info', () => {
    cy.task('stubSignIn')
    cy.task('stubKeyworkerDetails')

    navigateToTestPage()

    cy.findByRole('heading', { name: /^Test Keyworker$/i }).should('be.visible')
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/profile-summary', { failOnStatusCode: false })
  }
})
