import { v4 as uuidV4 } from 'uuid'

context('Update capacity and status', () => {
  const journeyId = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task('stubKeyworkerDetails')
    cy.task('stubKeyworkerStatuses')
    cy.task('stubUpdateKeyworkerProperties')
  })

  it('should show initial data', () => {
    navigateToTestPage()
    cy.url().should('match', /\/update-capacity-status$/)

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

  it('should reject an invalid number and show a message', () => {
    navigateToTestPage()

    cy.get('.govuk-error-summary').should('not.exist')

    cy.get('#capacity').clear().type('1001')
    cy.get('#capacity').should('have.value', '1001')
    cy.findByRole('button', { name: /Save and continue/i }).click()
    cy.get('.govuk-error-summary').should('exist')
    cy.get('ul.govuk-error-summary__list a').should('have.text', 'Number must be between 0 and 999')
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(`/${journeyId}/start-update-key-worker/488095?proceedTo=update-capacity-status`, {
      failOnStatusCode: false,
    })
  }
})
