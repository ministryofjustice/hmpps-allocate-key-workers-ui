context('Update capacity and status', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task('stubKeyworkerDetails')
    cy.task('stubKeyworkerStatuses')
    cy.task('stubUpdateKeyworkerProperties')
  })

  it('should show initial data', () => {
    navigateToTestPage()

    cy.get('.govuk-heading-l').eq(0).should('have.text', 'Available-Active Key-Worker')
    cy.get('.status-tag').eq(0).should('have.text', 'Active')

    cy.get('.govuk-heading-s').eq(0).should('have.text', 'Establishment')
    cy.get('p').eq(1).should('have.text', 'Leeds')
    cy.get('.govuk-heading-s').eq(1).should('have.text', 'Schedule type')
    cy.get('p').eq(2).should('have.text', 'Full Time')
    cy.get('.govuk-heading-s').eq(2).should('have.text', 'Prisoners allocated')
    cy.get('p').eq(3).should('have.text', '1')
    cy.get('.govuk-heading-s').eq(3).should('have.text', 'Maximum capacity')
    cy.get('#capacity').should('be.visible')
    cy.get('#capacity').should('have.value', '6')
    cy.get('.govuk-heading-s').eq(4).should('have.text', 'Status')
    cy.get('#status').should('be.visible')
    cy.get('#status').should('have.value', 'ACTIVE')
  })

  it("should update the keyworker's details", () => {
    navigateToTestPage()

    cy.get('.govuk-notification-banner__heading').should('not.exist')

    cy.get('#capacity').clear().type('8')
    cy.get('#capacity').should('have.value', '8')
    cy.get('#status').select('INACTIVE')
    cy.get('#status').should('have.value', 'INACTIVE')
    cy.findByRole('button', { name: /Save and continue/i }).click()

    cy.get('.govuk-notification-banner__heading')
      .should('exist')
      .and('contain', "You have updated this keyworker's capacity.")
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/key-worker-profile/488095/update-capacity-status', { failOnStatusCode: false })
  }
})
