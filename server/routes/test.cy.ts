import AuthorisedRoles from '../authentication/authorisedRoles'

context('test / homepage', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
  })

  describe('Role based access', () => {
    it('should show an error screen if the user has no roles and the call to the backend fails', () => {
      cy.task('stubSignIn', {
        roles: [],
      })
      cy.task('stubKeyworkerApiStatusFail')
      navigateToTestPage()
      cy.title().should('equal', 'Sorry, there is a problem - Key workers - DPS')
      cy.findByText('Sorry, there is a problem with the service').should('be.visible')
    })

    it('should redirect to not-authorised page if user has no permission', () => {
      cy.task('stubSignIn', {
        roles: [],
      })
      cy.task('stubKeyworkerApiStatusIsNotKeyworker')
      cy.task('stubEnabledPrison')

      navigateToTestPage()
      cy.title().should('equal', 'Not authorised - Key workers - DPS')
      cy.url().should('include', 'not-authorised')
      cy.findByText('You do not have permission to access this page').should('be.visible')
      cy.findByText('Contact the helpdesk').should('be.visible')
    })

    it('should show correct services when user has only a view permission', () => {
      cy.task('stubSignIn', {
        roles: [],
      })
      cy.task('stubKeyworkerApiStatusIsKeyworker')
      cy.task('stubEnabledPrison')

      navigateToTestPage()
      cy.title().should('equal', 'Key workers - DPS')
      validateTiles(true)
    })

    it('should show correct services when user has allocate permission', () => {
      cy.task('stubSignIn', {
        roles: [AuthorisedRoles.OMIC_ADMIN],
      })
      cy.task('stubKeyworkerApiStatusIsNotKeyworker')
      cy.task('stubEnabledPrison')

      navigateToTestPage()
      cy.title().should('equal', 'Key workers - DPS')
      validateTiles(false)
    })

    it('should show correct services when user has admin permission', () => {
      cy.task('stubSignIn', {
        roles: [AuthorisedRoles.KW_MIGRATION],
      })
      cy.task('stubKeyworkerApiStatusIsNotKeyworker')
      cy.task('stubEnabledPrison')

      navigateToTestPage()
      cy.title().should('equal', 'Key workers - DPS')
      validateTiles(false)
    })
  })

  const validateTiles = (readonly = false) => {
    cy.get('h2 > .card__link').should('have.length', readonly ? 3 : 5)

    cy.get('h2 > .card__link')
      .eq(0)
      .should('contain.text', 'Allocate key workers to prisoners')
      .and('have.attr', 'href', '/key-worker/allocate')
    cy.get('.card__description')
      .eq(0)
      .should(
        'contain.text',
        'View all prisoners or filter by location or allocation status, search for individuals, and automatically assign key workers.',
      )
    cy.get('h2 > .card__link')
      .eq(1)
      .should('contain.text', 'Manage key workers')
      .and('have.attr', 'href', '/key-worker/manage-staff')
    cy.get('.card__description')
      .eq(1)
      .should(
        'contain.text',
        'View key workers, change their status and capacity, and view and reassign their prisoners.',
      )
    cy.get('h2 > .card__link')
      .eq(2)
      .should('contain.text', 'View key worker data')
      .and('have.attr', 'href', '/key-worker/staff-data')
    cy.get('.card__description').eq(2).should('contain.text', 'View key worker data for your establishment.')

    if (!readonly) {
      cy.get('h2 > .card__link')
        .eq(3)
        .should('contain.text', 'Manage key worker role')
        .and('have.attr', 'href', '/key-worker/manage-staff-roles')
      cy.get('.card__description')
        .eq(3)
        .should(
          'contain.text',
          'Assign or remove the key worker role for individual staff members in your establishment.',
        )
      cy.get('h2 > .card__link')
        .eq(4)
        .should('contain.text', 'Manage your establishment’s key worker settings')
        .and('have.attr', 'href', '/key-worker/establishment-settings')
      cy.get('.card__description')
        .eq(4)
        .should(
          'contain.text',
          'Enable automatic assignment of key workers, set capacity and view session frequency settings.',
        )
    }
  }

  it('should show service unavailable to non-admin user if prison does not have service enabled', () => {
    cy.task('stubSignIn')
    cy.task('stubPrisonNotEnabled')

    navigateToTestPage()
    cy.title().should('equal', 'Service not enabled - Key workers - DPS')
    cy.findByText('Key worker service not enabled').should('be.visible')
  })

  it('should show establishment config tile to admin user if prison does not have service enabled', () => {
    cy.task('stubSignIn', {
      roles: [AuthorisedRoles.KW_MIGRATION],
    })
    cy.task('stubKeyworkerApiStatusIsKeyworker')
    cy.task('stubPrisonNotEnabled')

    navigateToTestPage()
    cy.title().should('equal', 'Key workers - DPS')
    cy.get('h2 > .card__link').should('have.length', 1)
    cy.findByRole('link', { name: 'Manage your establishment’s key worker settings' }).should(
      'have.attr',
      'href',
      '/key-worker/establishment-settings',
    )
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/key-worker', { failOnStatusCode: false })
  }
})
