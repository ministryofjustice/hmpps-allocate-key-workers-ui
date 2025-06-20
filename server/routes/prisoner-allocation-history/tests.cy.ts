context('Prisoner Allocation History', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetPrisonerDetails')
    cy.task('stubGetPrisonerDetailsMDI')
    cy.task('stubPrisonerAllocations')
  })

  it('redirects to "not found" page if user does not have the correct role', () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/key-worker/prisoner-allocation-history/A9965EB?query=&location=&excludeActiveAllocations=true', {
      failOnStatusCode: false,
    })

    cy.findByText('Page not found')
  })

  it('adds back query params on the back link', () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/key-worker/prisoner-allocation-history/A9965EA?query=&location=&excludeActiveAllocations=true', {
      failOnStatusCode: false,
    })

    cy.findByRole('link', { name: /back/i }).should(
      'have.attr',
      'href',
      '/key-worker/allocate?query=&location=&excludeActiveAllocations=true',
    )
  })

  it('happy path', () => {
    navigateToTestPage()
    cy.title().should('equal', 'Prisoner key worker allocation history - Key workers - DPS')
    cy.findByRole('link', { name: /back/i }).should('have.attr', 'href', '/key-worker/allocate')

    cy.get('h1').should('have.text', 'Cat, Tabby (A9965EA)')

    cy.get('.govuk-heading-l').eq(0).should('have.text', 'Prisoner key worker allocation history')
    cy.findByText('Current and previous allocations: 2').should('be.visible')

    // Current key worker card
    cy.get('.govuk-summary-card__title')
      .eq(0)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Current key worker: Sample Keyworker')
      })

    cy.contains('dt', 'Establishment').next().should('include.text', 'Moorland (HMP & YOI)')

    cy.contains('dt', 'Allocated on').next().should('include.text', '17/04/2025 14:41')
    cy.contains('dt', 'Allocated by').next().should('include.text', 'Test Keyworker')
    cy.contains('dt', 'Deallocated on').next().should('include.text', '-')
    cy.contains('dt', 'Deallocated by').next().should('include.text', '-')
    cy.contains('dt', 'Deallocation reason').next().should('include.text', '-')

    // Previous key worker card
    cy.get('.govuk-summary-card__title').eq(1).should('include.text', 'Previous key worker: Smith Last-Name')
    cy.get('.govuk-summary-list__key').eq(6).should('include.text', 'Establishment')
    cy.get('.govuk-summary-list__value').eq(6).should('include.text', 'Moorland (HMP & YOI)')

    cy.get('.govuk-summary-list__key').eq(7).should('include.text', 'Allocated on')
    cy.get('.govuk-summary-list__value').eq(7).should('include.text', '18/12/2024 10:56')
    cy.get('.govuk-summary-list__key').eq(8).should('include.text', 'Allocated by')
    cy.get('.govuk-summary-list__value').eq(8).should('include.text', 'Foo Baz')
    cy.get('.govuk-summary-list__key').eq(9).should('include.text', 'Deallocated on')
    cy.get('.govuk-summary-list__value').eq(9).should('include.text', '12/02/2025 15:57')
    cy.get('.govuk-summary-list__key').eq(10).should('include.text', 'Deallocated by')
    cy.get('.govuk-summary-list__value').eq(10).should('include.text', 'Fake Doe')
    cy.get('.govuk-summary-list__key').eq(11).should('include.text', 'Deallocation reason')
    cy.get('.govuk-summary-list__value').eq(11).should('include.text', 'Manual')
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/key-worker/prisoner-allocation-history/A9965EA', { failOnStatusCode: false })
  }
})
