context('Prisoner Allocation History', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetPrisonerDetails')
    cy.task('stubPrisonerAllocations')
  })

  it('happy path', () => {
    navigateToTestPage()

    cy.get('.govuk-link--no-visited-state').eq(0).should('have.text', 'Cat, Tabby')
    cy.findByText('A9965EA')
    cy.get('.govuk-\\!-font-weight-bold').eq(1).should('have.text', 'Location')
    cy.findByText('2-1-005')

    cy.get('.govuk-heading-l').eq(0).should('have.text', 'Prisoner key worker allocation history')
    cy.get('.govuk-heading-m').eq(0).should('have.text', 'Current and previous allocations: 2')

    cy.get('.govuk-table__caption--m').eq(0).should('have.text', 'Current key worker: Tom Cat')
    cy.get('.govuk-table__header').eq(0).should('have.text', 'Establishment')
    cy.get('.govuk-table__cell').eq(0).should('have.text', 'Moorland (HMP & YOI)')
    cy.get('.govuk-table__header').eq(1).should('have.text', 'Allocated on')
    cy.get('.govuk-table__cell').eq(1).should('have.text', '17/04/2025 14:41')
    cy.get('.govuk-table__header').eq(2).should('have.text', 'Allocation type')
    cy.get('.govuk-table__cell').eq(2).should('have.text', 'Automatic')
    cy.get('.govuk-table__header').eq(3).should('have.text', 'Allocated by')
    cy.get('.govuk-table__cell').eq(3).should('have.text', 'Jerry Mouse')
    cy.get('.govuk-table__header').eq(4).should('have.text', 'Deallocated on')
    cy.get('.govuk-table__cell').eq(4).should('have.text', '-')
    cy.get('.govuk-table__header').eq(5).should('have.text', 'Deallocated by')
    cy.get('.govuk-table__cell').eq(5).should('have.text', '-')
    cy.get('.govuk-table__header').eq(6).should('have.text', 'Deallocation reason')
    cy.get('.govuk-table__cell').eq(6).should('have.text', '-')

    cy.get('.govuk-table__caption--m').eq(1).should('have.text', 'Previous key worker: Benny The Ball')
    cy.get('.govuk-table__header').eq(7).should('have.text', 'Establishment')
    cy.get('.govuk-table__cell').eq(7).should('have.text', 'Moorland (HMP & YOI)')
    cy.get('.govuk-table__header').eq(8).should('have.text', 'Allocated on')
    cy.get('.govuk-table__cell').eq(8).should('have.text', '18/12/2024 10:56')
    cy.get('.govuk-table__header').eq(9).should('have.text', 'Allocation type')
    cy.get('.govuk-table__cell').eq(9).should('have.text', 'Manual')
    cy.get('.govuk-table__header').eq(10).should('have.text', 'Allocated by')
    cy.get('.govuk-table__cell').eq(10).should('have.text', 'Officer Dibble')
    cy.get('.govuk-table__header').eq(11).should('have.text', 'Deallocated on')
    cy.get('.govuk-table__cell').eq(11).should('have.text', '12/02/2025 15:57')
    cy.get('.govuk-table__header').eq(12).should('have.text', 'Deallocated by')
    cy.get('.govuk-table__cell').eq(12).should('have.text', 'Top Cat')
    cy.get('.govuk-table__header').eq(13).should('have.text', 'Deallocation reason')
    cy.get('.govuk-table__cell').eq(13).should('have.text', 'Manual')
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/prisoner-allocation-history/A9965EA', { failOnStatusCode: false })
  }
})
