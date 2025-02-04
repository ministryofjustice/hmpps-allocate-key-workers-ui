context('Key worker statistics', () => {
  beforeEach(() => {
    cy.task('reset')
  })

  it('shows stats', () => {
    cy.task('stubSignIn')
    cy.task('stubKeyworkerApiStats')
    cy.task('stubKeyworkerMigrationStatus')

    navigateToTestPage()

    cy.findByRole('heading', { name: /^Key worker statistics for Leeds \(HMP\)$/i }).should('be.visible')

    cy.findByText('These statistics do not include people with a high complexity of need level.')
    cy.findByText('Prisoners in Leeds (HMP) have a key worker session every 1 week.')

    cy.findByRole('textbox', { name: 'From' }).should('be.visible')
    cy.findByRole('textbox', { name: 'To' }).should('be.visible')

    cy.findByText('Prisoner to key worker ratio')
    cy.findByText('6:1')

    cy.findByRole('button', { name: 'View' })

    cy.findByText(
      'Displaying statistics from 1 January 2025 to 31 January 2025. Comparing against statistics from 2 December 2024 to 31 December 2024.',
    )

    cy.get('.govuk-grid-column-one-quarter')
      .eq(0)
      .children()
      .eq(0)
      .should('have.text', 'Total number of active key workers')
    cy.get('.govuk-grid-column-one-quarter').eq(0).children().eq(1).should('have.text', '8')
    cy.get('.govuk-grid-column-one-quarter').eq(0).children().eq(2).should('have.text', '+2 increase')

    cy.get('.govuk-grid-column-one-quarter')
      .eq(1)
      .children()
      .eq(0)
      .should('have.text', 'Percentage of prisoners with an allocated key worker')
    cy.get('.govuk-grid-column-one-quarter').eq(1).children().eq(1).should('have.text', '69.69 %')
    cy.get('.govuk-grid-column-one-quarter').eq(1).children().eq(2).should('have.text', '+27.69 % increase')

    cy.get('.govuk-grid-column-one-quarter')
      .eq(2)
      .children()
      .eq(0)
      .should('have.text', 'Average time from reception to key worker allocation')
    cy.get('.govuk-grid-column-one-quarter').eq(2).children().eq(1).should('have.text', '-')
    cy.get('.govuk-grid-column-one-quarter').eq(2).children().eq(2).should('have.text', 'No change')

    cy.get('.govuk-grid-column-one-quarter')
      .eq(3)
      .children()
      .eq(0)
      .should('have.text', 'Average time from reception to first key worker session')
    cy.get('.govuk-grid-column-one-quarter').eq(3).children().eq(1).should('have.text', '-')
    cy.get('.govuk-grid-column-one-quarter').eq(3).children().eq(2).should('have.text', 'No change')

    cy.get('.govuk-grid-column-one-quarter')
      .eq(4)
      .children()
      .eq(0)
      .should('have.text', 'Number of projected key worker sessions')
    cy.get('.govuk-grid-column-one-quarter').eq(4).children().eq(1).should('have.text', '167')
    cy.get('.govuk-grid-column-one-quarter').eq(4).children().eq(2).should('have.text', '+1 increase')

    cy.get('.govuk-grid-column-one-quarter')
      .eq(5)
      .children()
      .eq(0)
      .should('have.text', 'Number of recorded key worker sessions')
    cy.get('.govuk-grid-column-one-quarter').eq(5).children().eq(1).should('have.text', '0')
    cy.get('.govuk-grid-column-one-quarter').eq(5).children().eq(2).should('have.text', 'No change')

    cy.get('.govuk-grid-column-one-quarter').eq(6).children().eq(0).should('have.text', 'Compliance rate')
    cy.get('.govuk-grid-column-one-quarter').eq(6).children().eq(1).should('have.text', '0 %')
    cy.get('.govuk-grid-column-one-quarter').eq(6).children().eq(2).should('have.text', 'No change')
  })

  it('shows "no data" message when there is no data', () => {
    cy.task('stubSignIn')
    cy.task('stubKeyworkerApiStatsNoData')
    cy.task('stubKeyworkerMigrationStatus')

    navigateToTestPage()

    cy.findByRole('heading', { name: /^Key worker statistics for Leeds \(HMP\)$/i }).should('be.visible')

    cy.findByText('These statistics do not include people with a high complexity of need level.')
    cy.findByText('Prisoners in Leeds (HMP) have a key worker session every 1 week.')

    cy.findByRole('textbox', { name: 'From' }).should('be.visible')
    cy.findByRole('textbox', { name: 'To' }).should('be.visible')

    cy.findByText('Prisoner to key worker ratio')
    cy.findByText('6:1')

    cy.findByRole('button', { name: 'View' })

    cy.findByText('There is no data for this period.').should('be.visible')
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/key-worker-statistics', { failOnStatusCode: false })
  }
})
