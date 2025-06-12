import AuthorisedRoles from '../../authentication/authorisedRoles'

context('/manage-staff-roles', () => {
  const getAssignRadio = () => cy.findByRole('radio', { name: `Make someone a key worker` })
  const getRemoveRadio = () => cy.findByRole('radio', { name: `Remove the key worker role from someone` })
  const getContinueButton = () => cy.findByRole('button', { name: 'Continue' })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubKeyworkerApiStatusIsKeyworker')
    cy.task('stubEnabledPrison')
    cy.task('stubSignIn', {
      roles: [AuthorisedRoles.KW_MIGRATION],
    })
  })

  it('should proceed to Assign staff role journey', () => {
    navigateToTestPage()
    cy.url().should('match', /\/manage-staff-roles$/)

    verifyPageContent()
    verifyValidationErrors()

    getAssignRadio().click()
    getContinueButton().click()

    cy.url().should('match', /\/manage-staff-roles\/assign$/)
  })

  it('should proceed to Remove staff role journey', () => {
    navigateToTestPage()
    cy.url().should('match', /\/manage-staff-roles$/)

    verifyPageContent()
    verifyValidationErrors()

    getRemoveRadio().click()
    getContinueButton().click()

    cy.url().should('match', /\/manage-staff-roles\/remove$/)
  })

  const verifyPageContent = () => {
    cy.findByRole('heading', {
      name: 'Do you want to make someone a key worker or remove the role from someone?',
    }).should('be.visible')
    getAssignRadio().should('exist')
    getRemoveRadio().should('exist')
    getContinueButton().should('be.visible')
  }

  const verifyValidationErrors = () => {
    getContinueButton().click()

    cy.findByRole('link', { name: /Select if you want to assign or remove the key worker role$/i })
      .should('be.visible')
      .click()
    getAssignRadio().should('be.focused')
  }

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(`/key-worker/manage-staff-roles`, { failOnStatusCode: false })
  }
})
