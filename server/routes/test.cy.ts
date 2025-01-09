context('test / homepage', () => {
  beforeEach(() => {
    cy.task('reset')
  })

  it('shows all tiles when user has all required roles', () => {
    cy.task('stubSignIn', {
      roles: [],
    })
    navigateToTestPage()

    cy.findByRole('heading', { name: /^Key workers$/i }).should('be.visible')

    cy.findByRole('link', { name: /View all without a key worker$/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('to.equal', 'https://legacy.key-workers.url/manage-key-workers/allocate-key-worker')

    cy.findByRole('link', { name: /View by residential location$/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('to.equal', 'https://legacy.key-workers.url/manage-key-workers/view-residential-location')

    cy.findByRole('link', { name: /Search for a prisoner$/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('to.equal', 'https://legacy.key-workers.url/manage-key-workers/search-for-prisoner')

    cy.findByRole('link', { name: /View key workers in your establishment$/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('to.equal', 'https://legacy.key-workers.url/key-worker-search')

    cy.findByRole('link', { name: /Key worker statistics$/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('to.equal', 'https://legacy.key-workers.url/key-worker-statistics')

    cy.findByRole('link', { name: /Manage your establishment’s key worker settings$/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('to.equal', 'https://legacy.key-workers.url/manage-key-worker-settings')
  })

  it.skip('shows unauthorised message if user does not have any of the required roles', () => {
    cy.task('stubSignIn', {
      roles: [],
    })
    navigateToTestPage()
    cy.findByText('You are not authorised to use this application.').should('be.visible')
    cy.findByRole('heading', { name: /^Key workers$/i }).should('not.exist')
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/', { failOnStatusCode: false })
  }
})
