import AuthorisedRoles from '../authentication/authorisedRoles'

context('test / homepage', () => {
  beforeEach(() => {
    cy.task('reset')
  })

  describe('Role based access', () => {
    it('should show an error screen if the has no roles and the call to the backend fails', () => {
      cy.task('stubSignIn', {
        roles: [],
      })
      cy.task('stubKeyworkerApiStatusFail')
      navigateToTestPage()
      cy.findByText('Sorry, there is a problem with the service').should('be.visible')
    })

    it('should redirect to not-authorised page if user has no permission', () => {
      cy.task('stubSignIn', {
        roles: [],
      })
      cy.task('stubKeyworkerApiStatusIsNotKeyworker')
      cy.task('stubPrisonNoHighRisk')

      navigateToTestPage()
      cy.url().should('include', 'not-authorised')
      cy.findByText('You do not have permission to access this page').should('be.visible')
      cy.findByText('Contact the helpdesk').should('be.visible')
    })

    it('should show correct services when user has only a view permission', () => {
      cy.task('stubSignIn', {
        roles: [],
      })
      cy.task('stubKeyworkerApiStatusIsKeyworker')
      cy.task('stubPrisonNoHighRisk')

      navigateToTestPage()

      cy.findByRole('heading', { name: /^Key workers$/i }).should('be.visible')

      cy.findByRole('link', { name: /View all without a key worker$/i }).should('be.visible')

      cy.findByRole('link', { name: /View by residential location$/i }).should('be.visible')

      cy.findByRole('link', { name: /Search for a prisoner$/i }).should('be.visible')

      cy.findByRole('link', { name: /View key workers in your establishment$/i }).should('be.visible')

      cy.findByText('You can view a key worker’s availability and check their individual statistics.')

      cy.findByRole('link', { name: /Key worker statistics$/i }).should('be.visible')

      cy.findAllByRole('link', { name: /Manage your establishment’s key worker settings$/i }).should('not.exist')
    })

    it('should show correct services when user has allocate permission', () => {
      cy.task('stubSignIn', {
        roles: [AuthorisedRoles.OMIC_ADMIN],
      })
      cy.task('stubKeyworkerApiStatusIsNotKeyworker')
      cy.task('stubPrisonNoHighRisk')

      navigateToTestPage()

      cy.findByRole('heading', { name: /^Key workers$/i }).should('be.visible')

      cy.findByRole('link', { name: /View all without a key worker$/i }).should('be.visible')

      cy.findByRole('link', { name: /View by residential location$/i }).should('be.visible')

      cy.findByRole('link', { name: /Search for a prisoner$/i }).should('be.visible')

      cy.findByRole('link', { name: /View key workers in your establishment$/i }).should('be.visible')

      cy.findByText(
        'You can manage a key worker’s availability, reassign their prisoners and check their individual statistics.',
      )

      cy.findByRole('link', { name: /Key worker statistics$/i }).should('be.visible')

      cy.findAllByRole('link', { name: /Manage your establishment’s key worker settings$/i }).should('be.visible')
    })
  })

  it('shows all tiles when user has all required roles', () => {
    cy.task('stubSignIn', {
      roles: [AuthorisedRoles.OMIC_ADMIN, AuthorisedRoles.KEYWORKER_MONITOR],
    })
    cy.task('stubPrisonNoHighRisk')
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
      .and('to.equal', '/key-worker-statistics')

    cy.findByRole('link', { name: /Manage your establishment’s key worker settings$/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('to.equal', 'https://legacy.key-workers.url/manage-key-worker-settings')
  })

  it('should not show extra text when prison has no high risk prisoners', () => {
    cy.task('stubSignIn', {
      roles: [AuthorisedRoles.OMIC_ADMIN, AuthorisedRoles.KEYWORKER_MONITOR],
    })
    cy.task('stubPrisonNoHighRisk')

    navigateToTestPage()

    cy.findByRole('heading', { name: /^Key workers$/i }).should('be.visible')

    cy.findByRole('link', { name: /View all without a key worker$/i }).should('be.visible')

    cy.findByRole('link', { name: /View by residential location$/i }).should('be.visible')

    cy.findByRole('link', { name: /Search for a prisoner$/i }).should('be.visible')

    cy.findByRole('link', { name: /View key workers in your establishment$/i }).should('be.visible')

    cy.findByText('View all prisoners in a residential location and allocate or change key workers.')
  })

  it('should show extra text when prison has high risk prisoners', () => {
    cy.task('stubSignIn', {
      roles: [AuthorisedRoles.OMIC_ADMIN, AuthorisedRoles.KEYWORKER_MONITOR],
    })
    cy.task('stubKeyworkerMigrationStatus')

    navigateToTestPage()

    cy.findByRole('heading', { name: /^Key workers$/i }).should('be.visible')

    cy.findByRole('link', { name: /View all without a key worker$/i }).should('be.visible')

    cy.findByRole('link', { name: /View by residential location$/i }).should('be.visible')

    cy.findByRole('link', { name: /Search for a prisoner$/i }).should('be.visible')

    cy.findByRole('link', { name: /View key workers in your establishment$/i }).should('be.visible')

    cy.contains(
      /View all prisoners in a residential location and allocate or change key workers\. You can also see high complexity prisoners/,
    ).should('be.visible')
  })

  it('should show service unavailable if prison does not have service enabled', () => {
    cy.task('stubSignIn')
    cy.task('stubPrisonNotEnabled')

    navigateToTestPage()

    cy.findByText('Sorry, there is a problem with the service').should('be.visible')
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/', { failOnStatusCode: false })
  }
})
