context('Profile Info', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
  })

  it('should show profile info', () => {
    cy.task('stubKeyworkerDetails')

    navigateToTestPage()

    cy.findByRole('heading', { name: /^AVAILABLE-ACTIVE KEY-WORKER$/i }).should('be.visible')
    cy.get('.status-tag').eq(0).should('have.text', 'Active')
    cy.get('.govuk-link').eq(0).should('have.text', 'Update capacity and status')

    // Details panel
    cy.get('.govuk-grid-column-one-quarter').eq(0).children().eq(0).should('have.text', 'Establishment')
    cy.get('.govuk-grid-column-one-quarter').eq(0).children().eq(1).should('have.text', 'Leeds')

    cy.get('.govuk-grid-column-one-quarter').eq(1).children().eq(0).should('have.text', 'Schedule type')
    cy.get('.govuk-grid-column-one-quarter').eq(1).children().eq(1).should('have.text', 'Full Time')

    cy.get('.govuk-grid-column-one-quarter').eq(2).children().eq(0).should('have.text', 'Prisoners allocated')
    cy.get('.govuk-grid-column-one-quarter').eq(2).children().eq(1).should('have.text', '1')

    cy.get('.govuk-grid-column-one-quarter').eq(3).children().eq(0).should('have.text', 'Maximum capacity')
    cy.get('.govuk-grid-column-one-quarter').eq(3).children().eq(1).should('have.text', '6')

    // Stats panel
    cy.get('.govuk-grid-column-one-quarter').eq(4).children().eq(0).should('have.text', 'Projected sessions')
    cy.get('.govuk-grid-column-one-quarter').eq(4).children().eq(1).should('have.text', '1')
    cy.get('.govuk-grid-column-one-quarter').eq(4).children().eq(2).should('have.text', '+4 increase')

    cy.get('.govuk-grid-column-one-quarter').eq(5).children().eq(0).should('have.text', 'Recorded sessions')
    cy.get('.govuk-grid-column-one-quarter').eq(5).children().eq(1).should('have.text', '3')
    cy.get('.govuk-grid-column-one-quarter').eq(5).children().eq(2).should('have.text', '+3 increase')

    cy.get('.govuk-grid-column-one-quarter').eq(6).children().eq(0).should('have.text', 'Session compliance')
    cy.get('.govuk-grid-column-one-quarter').eq(6).children().eq(1).should('have.text', '0 %')
    cy.get('.govuk-grid-column-one-quarter').eq(6).children().eq(2).should('have.text', 'No change')

    cy.get('.govuk-grid-column-one-quarter').eq(7).children().eq(0).should('have.text', 'Case notes written')
    cy.get('.govuk-grid-column-one-quarter').eq(7).children().eq(1).should('have.text', '5')
    cy.get('.govuk-grid-column-one-quarter').eq(7).children().eq(2).should('have.text', '+5 increase')

    // Allocations panel
    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'Blue, Second')
    cy.get('.govuk-table__row').eq(1).children().eq(1).should('contain.text', '1-2-011')
    cy.get('.govuk-table__row').eq(1).children().eq(2).should('contain.text', '1/2/2025')
    cy.get('.govuk-table__row').eq(1).children().eq(3).should('contain.text', 'Standard')
    cy.get('.govuk-table__row').eq(1).children().eq(4).should('contain.text', '23/1/2025')
    cy.get('[data-sort-value="Blue, Second"] > .govuk-link--no-visited-state').should(
      'have.attr',
      'href',
      'http://localhost:3001/prisoner/A9013EA',
    )

    cy.get('[data-sort-value="Blue, Second"] > .govuk-link--no-visited-state').should('have.attr', 'target', '_blank')
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/key-worker-profile/485585', { failOnStatusCode: false })
  }
})
