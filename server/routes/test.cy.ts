import AuthorisedRoles from '../authentication/authorisedRoles'

context('test / homepage', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
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
      cy.task('stubEnabledPrison')

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
      cy.task('stubEnabledPrison')

      navigateToTestPage()

      validateTiles(true)
    })

    it('should show correct services when user has allocate permission', () => {
      cy.task('stubSignIn', {
        roles: [AuthorisedRoles.OMIC_ADMIN],
      })
      cy.task('stubKeyworkerApiStatusIsNotKeyworker')
      cy.task('stubEnabledPrison')

      navigateToTestPage()

      validateTiles(false)
    })

    it('should show correct services when user has admin permission', () => {
      cy.task('stubSignIn', {
        roles: [AuthorisedRoles.KW_MIGRATION],
      })
      cy.task('stubKeyworkerApiStatusIsNotKeyworker')
      cy.task('stubEnabledPrison')

      navigateToTestPage()

      validateTiles(false)
    })
  })

  const validateTiles = (readonly = false) => {
    cy.get('h2 > .card__link').should('have.length', readonly ? 3 : 5)

    cy.get('h2 > .card__link')
      .eq(0)
      .should('contain.text', 'Allocate key workers to prisoners')
      .and('have.attr', 'href', '/allocate-key-workers')
    cy.get('.card__description')
      .eq(0)
      .should(
        'contain.text',
        'View all prisoners or filter by location or allocation status, search for individuals, and automatically assign key workers.',
      )
    cy.get('h2 > .card__link')
      .eq(1)
      .should('contain.text', 'Manage key workers')
      .and('have.attr', 'href', '/manage-key-workers')
    cy.get('.card__description')
      .eq(1)
      .should(
        'contain.text',
        'View key workers, change their status and capacity, and view and reassign their prisoners.',
      )
    cy.get('h2 > .card__link')
      .eq(2)
      .should('contain.text', 'View key worker data')
      .and('have.attr', 'href', '/key-workers-data')
    cy.get('.card__description').eq(2).should('contain.text', 'View key worker data for your establishment.')

    if (!readonly) {
      cy.get('h2 > .card__link')
        .eq(3)
        .should('contain.text', 'Make someone a key worker')
        .and('have.attr', 'href', '/key-worker/assign-staff-role')
      cy.get('.card__description')
        .eq(3)
        .should('contain.text', 'Assign the key worker role to staff members in your establishment.')
      cy.get('h2 > .card__link')
        .eq(4)
        .should('contain.text', 'Manage your establishment’s key worker settings')
        .and('have.attr', 'href', '/establishment-settings')
      cy.get('.card__description')
        .eq(4)
        .should(
          'contain.text',
          'Enable automatic assignment of key workers, set capacity and view session frequency settings.',
        )
    }
  }

  it('should show service unavailable if prison does not have service enabled', () => {
    cy.task('stubSignIn')
    cy.task('stubPrisonNotEnabled')

    navigateToTestPage()

    cy.findByText('Service not enabled').should('be.visible')
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/', { failOnStatusCode: false })
  }
})
