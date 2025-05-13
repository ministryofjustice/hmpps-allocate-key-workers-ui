context('Profile Info', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task('stubResidentialHierarchy')
    cy.task('stubSearchPrisonersWithQuery')
    cy.task('stubSearchPrisonersWithLocation')
    cy.task('stubSearchPrisoner')
    cy.task('stubKeyworkerMembersAll')
    cy.task('stubSearchPrisonersWithExcludeAllocations')
    cy.task('stubKeyworkerMembersStatusActive')
    cy.task('stubPutAllocationSuccess')
    cy.task('stubPutDeallocationSuccess')
  })

  it('should load page correctly', () => {
    navigateToTestPage()

    checkPageContentsNoFilter()

    checkSorting()

    checkPrisonersExcludeActiveAllocationsFilter()

    checkNameOrPrisonNumberFilter()

    checkResidentialLocationFilter()
  })

  it('should handle invalid queries', () => {
    navigateToTestPage()

    cy.visit('/allocate-key-workers?query=<script>alert%28%27inject%27%29<%2Fscript>', { failOnStatusCode: false })
    cy.findByRole('textbox', { name: /Name or prison number/ }).should('have.value', '')
    cy.get('.govuk-table__row').should('have.length', 4)

    cy.visit('/allocate-key-workers?cellLocationPrefix=<script>alert%28%27inject%27%29<%2Fscript>', {
      failOnStatusCode: false,
    })
    cy.findByRole('combobox', { name: /Residential location/ }).should('have.value', '')
    cy.get('.govuk-table__row').should('have.length', 4)
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

    cy.visit('/allocate-key-workers?query=Ayo', { failOnStatusCode: false })

    cy.get('.govuk-table__row').should('have.length', 2)
    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'Ayo, Zakira')

    cy.get('#selectKeyworker').select('Deallocate')

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

    cy.visit('/allocate-key-workers?query=Ayo', { failOnStatusCode: false })

    cy.get('.govuk-table__row').should('have.length', 2)
    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'Ayo, Zakira')

    cy.get('#selectKeyworker').should('contain', 'Select key worker')
    cy.get('#selectKeyworker').should('contain', 'Deallocate')
    cy.get('#selectKeyworker').should('not.contain', 'Key-Worker, Available-Active (allocations: 32)')
    cy.get('#selectKeyworker').select('Deallocate')

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

    cy.visit('/allocate-key-workers', { failOnStatusCode: false })

    cy.get('.govuk-table__row').should('have.length', 4)
    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'Ayo, Zakira')

    // First select should contain deallocate and not the active key worker - the rest should should key worker but not deallocate
    cy.get('select').eq(1).should('contain', 'Deallocate')
    cy.get('select').eq(1).should('not.contain', 'Key-Worker, Available-Active (allocations: 32)')

    cy.get('select').eq(2).should('not.contain', 'Deallocate')
    cy.get('select').eq(2).should('contain', 'Key-Worker, Available-Active (allocations: 32)')
    cy.get('select').eq(3).should('not.contain', 'Deallocate')
    cy.get('select').eq(3).should('contain', 'Key-Worker, Available-Active (allocations: 32)')

    cy.get('select').eq(1).select('Key-Worker, Available-Active2 (allocations: 32)')
    cy.get('select').eq(2).select('Key-Worker, Available-Active2 (allocations: 32)')

    cy.findByRole('button', { name: /Save changes/i }).click()

    cy.verifyLastAPICall(
      { method: 'PUT' },
      {
        allocations: [
          { personIdentifier: 'A4288DZ', staffId: 488096, allocationReason: 'MANUAL' },
          { personIdentifier: 'A2504EA', staffId: 488096, allocationReason: 'MANUAL' },
        ],
        deallocations: [],
      },
    )

    cy.get('.moj-alert').should('contain.text', 'Changes made successfully')
    cy.findByText('You have successfully made changes to 2 prisoners.').should('exist')
  })

  const checkPageContentsNoFilter = () => {
    cy.findByRole('heading', { name: /Allocate key workers to prisoners/i }).should('be.visible')
    cy.findByRole('heading', { name: /Filter by/i }).should('be.visible')
    cy.findByRole('button', { name: /Apply filters/i }).should('be.visible')
    cy.findByRole('link', { name: /Clear/i }).should('be.visible').should('have.attr', 'href', '?clear=true')

    cy.findByRole('textbox', { name: /Name or prison number/ }).should('exist')
    cy.findByRole('combobox', { name: /Residential location/ }).should('exist')

    cy.findByRole('checkbox', { name: /Prisoners without a key worker/ }).should('exist')

    cy.findByText('Select key workers from the dropdown lists to reallocate or deallocate prisoners.').should('exist')
    cy.findByText('Key workers will only be allocated when you save your changes.').should('exist')

    cy.findByRole('button', { name: 'Assign key workers automatically' }).should('exist')

    cy.get('.moj-pagination').should('have.length', 2).eq(0).should('contain.text', 'Showing 1 to 3 of 3 results')

    cy.get('.govuk-table__row').should('have.length', 4)
    cy.get('.govuk-table__row')
      .eq(0)
      .children()
      .eq(0)
      .should('contain.text', 'Name and prisoner number')
      .children()
      .should('have.length', 1)
    cy.get('.govuk-table__row')
      .eq(0)
      .children()
      .eq(1)
      .should('contain.text', 'Residential location')
      .children()
      .should('have.length', 1)
    cy.get('.govuk-table__row')
      .eq(0)
      .children()
      .eq(2)
      .should('contain.text', 'Key worker')
      .children()
      .should('have.length', 1)
    cy.get('.govuk-table__row')
      .eq(0)
      .children()
      .eq(3)
      .should('contain.text', 'Change key worker')
      .children()
      .should('have.length', 0)
    cy.get('.govuk-table__row').eq(0).children().eq(4).should('contain.text', '').children().should('have.length', 0)

    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'Ayo, Zakira')
    cy.get('.govuk-table__row').eq(1).children().eq(1).should('contain.text', '1-1-035')
    cy.get('.govuk-table__row').eq(1).children().eq(2).should('contain.text', 'Cooper, Rob')
    cy.get('.govuk-table__row')
      .eq(1)
      .children()
      .eq(3)
      .should('contain.text', 'Key-Worker, Available-Active2 (allocations: 32)')
    cy.get('.govuk-table__row')
      .eq(1)
      .children()
      .eq(4)
      .should('contain.text', 'View allocation history')
      .children()
      .eq(0)
      .should('have.attr', 'href', '/prisoner-allocation-history/A4288DZ')

    cy.findByRole('button', { name: 'Save changes' }).should('exist')
  }

  const checkPrisonersExcludeActiveAllocationsFilter = () => {
    cy.findByRole('checkbox', { name: /Prisoners without a key worker/ }).check()
    cy.findByRole('button', { name: /Apply filters/i }).click()

    cy.get('.moj-pagination').should('have.length', 2).eq(0).should('contain.text', 'Showing 1 to 2 of 2 results')

    cy.get('.govuk-table__row').should('have.length', 3)
    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'Bogisich, Astrid')
    cy.get('.govuk-table__row').eq(1).children().eq(1).should('contain.text', '3-1-027')
    cy.get('.govuk-table__row').eq(1).children().eq(2).should('contain.text', '-')
    cy.get('.govuk-table__row')
      .eq(1)
      .children()
      .eq(3)
      .should('contain.text', 'Key-Worker, Available-Active (allocations: 32)')
    cy.get('.govuk-table__row')
      .eq(1)
      .children()
      .eq(4)
      .should('contain.text', 'View allocation history')
      .children()
      .eq(0)
      .should(
        'have.attr',
        'href',
        '/prisoner-allocation-history/A2504EA?query=&cellLocationPrefix=&excludeActiveAllocations=true',
      )

    cy.get('.govuk-table__row').eq(2).children().eq(0).should('contain.text', 'Capodilupo, Darwin')
    cy.get('.govuk-table__row').eq(2).children().eq(1).should('contain.text', '4-2-031')
    cy.get('.govuk-table__row').eq(2).children().eq(2).should('contain.text', '-')
    cy.get('.govuk-table__row')
      .eq(2)
      .children()
      .eq(3)
      .should('contain.text', 'Key-Worker, Available-Active (allocations: 32)')
    cy.get('.govuk-table__row').eq(2).children().eq(4).should('not.contain.text', 'View allocation history')
  }

  const checkSorting = () => {
    cy.get('.govuk-table__row').eq(0).children().eq(2).should('contain.text', 'Key worker').click()

    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'Bogisich, Astrid')
    cy.get('.govuk-table__row').eq(2).children().eq(0).should('contain.text', 'Capodilupo, Darwin')
    cy.get('.govuk-table__row').eq(3).children().eq(0).should('contain.text', 'Ayo, Zakira')
  }

  const checkResidentialLocationFilter = () => {
    cy.findByRole('textbox', { name: /Name or prison number/ }).clear()
    cy.findByRole('combobox', { name: /Residential location/ }).select('Houseblock 3')
    cy.findByRole('button', { name: /Apply filters/i }).click()

    cy.get('.moj-pagination').should('have.length', 2).eq(0).should('contain.text', 'Showing 1 to 1 of 1 result')

    cy.get('.govuk-table__row').should('have.length', 2)
    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'Bogisich, Astrid')
    cy.get('.govuk-table__row')
      .eq(1)
      .children()
      .eq(4)
      .children()
      .eq(0)
      .should(
        'have.attr',
        'href',
        '/prisoner-allocation-history/A2504EA?query=&cellLocationPrefix=3&excludeActiveAllocations=false',
      )
  }

  const checkNameOrPrisonNumberFilter = () => {
    cy.findByRole('checkbox', { name: /Prisoners without a key worker/ }).uncheck()
    cy.findByRole('textbox', { name: /Name or prison number/ })
      .clear()
      .type('Ayo')
    cy.findByRole('button', { name: /Apply filters/i }).click()

    cy.get('.moj-pagination').should('have.length', 2).eq(0).should('contain.text', 'Showing 1 to 1 of 1 result')

    cy.get('.govuk-table__row').should('have.length', 2)
    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'Ayo, Zakira')
    cy.get('.govuk-table__row')
      .eq(1)
      .children()
      .eq(4)
      .children()
      .eq(0)
      .should(
        'have.attr',
        'href',
        '/prisoner-allocation-history/A4288DZ?query=Ayo&cellLocationPrefix=&excludeActiveAllocations=false',
      )
  }

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/allocate-key-workers', { failOnStatusCode: false })
  }
})
