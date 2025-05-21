context('Profile Info', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task('stubKeyworkerMembersStatusActive')
    cy.task('stubPutAllocationSuccess')
    cy.task('stubPutDeallocationSuccess')
    cy.task('stubKeyworkerDetails')
  })

  it('should show profile info', () => {
    navigateToTestPage()

    cy.findByRole('heading', { name: /^AVAILABLE-ACTIVE KEY-WORKER$/i }).should('be.visible')
    cy.get('.status-tag').eq(0).should('have.text', 'Active')
    cy.findByRole('link', { name: 'Update capacity and status' })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('equal', '/start-update-key-worker/488095?proceedTo=update-capacity-status')

    cy.findByText('Select key workers from the dropdown lists to reallocate or deallocate prisoners.').should('exist')
    cy.findByText('Key workers will only be allocated when you save your changes.').should('exist')

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
    cy.get('.govuk-table__row').eq(2).children().eq(0).should('contain.text', 'John, Doe')
    cy.get('.govuk-table__row').eq(2).children().eq(1).should('contain.text', '1-1-035')
    cy.get('.govuk-table__row').eq(2).children().eq(2).should('contain.text', '1/2/2025')
    cy.get('.govuk-table__row').eq(2).children().eq(3).should('contain.text', 'Standard')
    cy.get('.govuk-table__row').eq(2).children().eq(4).should('contain.text', '23/1/2025')
    cy.get('[data-sort-value="John, Doe"] > .govuk-link--no-visited-state').should(
      'have.attr',
      'href',
      'http://localhost:3001/prisoner/A4288DZ',
    )

    cy.get('[data-sort-value="John, Doe"] > .govuk-link--no-visited-state').should('have.attr', 'target', '_blank')
  })

  it('should show error when no allocations or deallocations are made', () => {
    navigateToTestPage()

    cy.findByRole('button', { name: /Save changes/i }).click()

    cy.findByText('There is a problem').should('be.visible')
    cy.findByRole('link', { name: 'At least one allocation or deallocation must be made' })
      .should('be.visible')
      .should('have.attr', 'href', '#selectKeyworker')
  })

  it('should show error on de/allocation failure', () => {
    cy.task('stubPutAllocationFail')
    navigateToTestPage()

    cy.visit('/key-worker-profile/488095', { failOnStatusCode: false })

    cy.get('.govuk-table__row').should('have.length', 3)
    cy.get('.govuk-table__row').eq(2).children().eq(0).should('contain.text', 'John, Doe')

    cy.findAllByRole('combobox').eq(1).select('Deallocate')

    cy.findByRole('button', { name: /Save changes/i }).click()
    cy.verifyLastAPICall(
      { method: 'PUT' },
      {
        allocations: [],
        deallocations: [{ personIdentifier: 'A4288DZ', staffId: 488095, deallocationReason: 'MANUAL' }],
      },
    )

    cy.get('.moj-alert').should('contain.text', 'Key workers could not be assigned to 1 prisoner')
    cy.findByText('This is because there are not enough key workers with available capacity.').should('exist')
    cy.findByText('To assign unallocated prisoners, you can:').should('exist')
    cy.findByText('view all prisoners without a key worker and manually allocate key workers').should('exist')
    cy.findByText('increase the capacity of your key workers').should('exist')
  })

  it('should show success message on deallocation', () => {
    cy.task('stubPutAllocationSuccess')
    cy.task('stubPutDeallocationSuccess')
    navigateToTestPage()

    cy.visit('/key-worker-profile/488095', { failOnStatusCode: false })

    cy.get('.govuk-table__row').should('have.length', 3)
    cy.get('.govuk-table__row').eq(2).children().eq(0).should('contain.text', 'John, Doe')

    cy.get('#selectKeyworker').should('contain', 'Select key worker')
    cy.get('#selectKeyworker').should('contain', 'Deallocate')
    cy.get('#selectKeyworker').should('not.contain', 'Key-Worker, Available-Active (allocations: 32)')
    cy.findAllByRole('combobox').eq(1).select('Deallocate')

    cy.findByRole('button', { name: /Save changes/i }).click()
    cy.verifyLastAPICall(
      { method: 'PUT' },
      {
        allocations: [],
        deallocations: [{ personIdentifier: 'A4288DZ', staffId: 488095, deallocationReason: 'MANUAL' }],
      },
    )

    cy.get('.moj-alert').should('contain.text', 'Changes made successfully')
    cy.findByText('You have successfully made changes to 1 prisoner.').should('exist')
  })

  it('should show success message on allocation', () => {
    cy.task('stubPutAllocationSuccess')
    cy.task('stubPutDeallocationSuccess')
    navigateToTestPage()

    cy.visit('/key-worker-profile/488095', { failOnStatusCode: false })

    cy.get('.govuk-table__row').should('have.length', 3)
    cy.get('.govuk-table__row').eq(2).children().eq(0).should('contain.text', 'John, Doe')

    cy.get('select').eq(0).should('contain', 'Deallocate')
    cy.get('select').eq(0).should('not.contain', 'Key-Worker, Available-Active (allocations: 32)')
    cy.get('select').eq(0).should('contain', 'Key-Worker, Available-Active2 (allocations: 32)')

    cy.get('select').eq(1).should('contain', 'Deallocate')
    cy.get('select').eq(1).should('not.contain', 'Key-Worker, Available-Active (allocations: 32)')
    cy.get('select').eq(1).should('contain', 'Key-Worker, Available-Active2 (allocations: 32)')

    cy.get('select').eq(0).select('Key-Worker, Available-Active2 (allocations: 32)')
    cy.get('select').eq(1).select('Key-Worker, Available-Active2 (allocations: 32)')

    cy.findByRole('button', { name: /Save changes/i }).click()

    cy.verifyLastAPICall(
      { method: 'PUT' },
      {
        allocations: [
          { personIdentifier: 'A2504EA', staffId: 488096, allocationReason: 'MANUAL' },
          { personIdentifier: 'A4288DZ', staffId: 488096, allocationReason: 'MANUAL' },
        ],
        deallocations: [],
      },
    )

    cy.get('.moj-alert').should('contain.text', 'Changes made successfully')
    cy.findByText('You have successfully made changes to 2 prisoners.').should('exist')
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/key-worker-profile/488095', { failOnStatusCode: false })
  }
})
