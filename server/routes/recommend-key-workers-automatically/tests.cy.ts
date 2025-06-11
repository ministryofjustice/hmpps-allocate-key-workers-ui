import AuthorisedRoles from '../../authentication/authorisedRoles'

context('/recommend-key-workers-automatically', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn', {
      roles: [AuthorisedRoles.OMIC_ADMIN, AuthorisedRoles.KEYWORKER_MONITOR, AuthorisedRoles.KW_MIGRATION],
    })
    cy.task('stubEnabledPrison')
    cy.task('stubResidentialHierarchy')
    cy.task('stubSearchPrisoner')
    cy.task('stubKeyworkerMembersAll')
    cy.task('stubSearchPrisonersWithExcludeAllocations')
    cy.task('stubKeyworkerMembersStatusActive')
    cy.task('stubPutAllocationSuccess')
    cy.task('stubPutDeallocationSuccess')
  })

  it('should load page correctly', () => {
    navigateToTestPage()

    checkPageContents()

    checkSorting()
  })

  it('should show error when no allocations or deallocations are made', () => {
    navigateToTestPage()

    cy.findByRole('button', { name: /Save changes/i }).click()

    cy.findByText('There is a problem').should('be.visible')
    cy.findByRole('link', { name: /Select key workers from the dropdown lists/ })
      .should('be.visible')
      .should('have.attr', 'href', '#selectKeyworker')
  })

  it('should show error on de/allocation failure', () => {
    cy.task('stubPutAllocationFail')
    navigateToTestPage()

    cy.visit('/key-worker/allocate-key-workers?query=John', { failOnStatusCode: false })

    cy.get('.govuk-table__row').should('have.length', 2)
    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'John, Doe')

    cy.get('#selectKeyworker').select('Deallocate')

    cy.findByRole('button', { name: /Save changes/i }).click()

    cy.verifyLastAPICall(
      { method: 'PUT' },
      {
        allocations: [],
        deallocations: [{ personIdentifier: 'A4288DZ', staffId: 488095, deallocationReason: 'MANUAL' }],
      },
    )

    cy.findByText('Sorry, there is a problem with the service').should('exist')
  })

  it('should show success message on deallocation', () => {
    cy.task('stubPutAllocationSuccess')
    cy.task('stubPutDeallocationSuccess')
    navigateToTestPage()

    cy.visit('/key-worker/allocate-key-workers?query=John', { failOnStatusCode: false })

    cy.get('.govuk-table__row').should('have.length', 2)
    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'John, Doe')

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

    cy.visit('/key-worker/allocate-key-workers', { failOnStatusCode: false })

    cy.get('.govuk-table__row').should('have.length', 4)
    cy.get('.govuk-table__row').eq(2).children().eq(0).should('contain.text', 'John, Doe')

    cy.get('select').eq(2).should('contain', 'Deallocate')
    cy.get('select').eq(2).should('not.contain', 'Key-Worker, Available-Active (allocations: 32)')

    cy.get('select').eq(1).should('not.contain', 'Deallocate')
    cy.get('select').eq(1).should('contain', 'Key-Worker, Available-Active (allocations: 32)')
    cy.get('select').eq(3).should('not.contain', 'Deallocate')
    cy.get('select').eq(3).should('contain', 'Key-Worker, Available-Active (allocations: 32)')

    cy.get('select').eq(1).select('Key-Worker, Available-Active2 (allocations: 32)')
    cy.get('select').eq(2).select('Key-Worker, Available-Active2 (allocations: 32)')

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

  const checkPageContents = () => {
    cy.findByRole('heading', { name: /Allocate key workers to prisoners/i }).should('be.visible')
    cy.findByRole('heading', { name: /Filter by/i }).should('be.visible')
    cy.findByRole('button', { name: /Apply filters/i }).should('be.visible')
    cy.findByRole('link', { name: /Clear/i }).should('be.visible').should('have.attr', 'href', '?clear=true')

    cy.findByRole('textbox', { name: /Name or prison number/ }).should('exist')
    cy.findByRole('combobox', { name: /Residential location/ }).should('exist')

    cy.findByRole('checkbox', { name: /Prisoners without a key worker/ }).should('exist')

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
    cy.get('.govuk-table__row').eq(0).children().should('have.length', 5)

    cy.get('.govuk-table__row')
      .eq(0)
      .children()
      .eq(3)
      .should('contain.text', 'Change key worker')
      .children()
      .should('have.length', 0)

    cy.get('.govuk-table__row').eq(0).children().eq(4).should('contain.text', '').children().should('have.length', 0)

    cy.get('.govuk-table__row').eq(2).children().eq(0).should('contain.text', 'John, Doe')
    cy.get('.govuk-table__row').eq(2).children().eq(1).should('contain.text', '1-1-035')
    cy.get('.govuk-table__row').eq(2).children().eq(2).should('contain.text', 'Key-Worker, Available-Active')

    cy.get('.govuk-table__row')
      .eq(2)
      .children()
      .eq(4)
      .should('contain.text', 'View allocation history')
      .children()
      .eq(0)
      .should('have.attr', 'href', '/key-worker/prisoner-allocation-history/A4288DZ')

    cy.get('.govuk-table__row')
      .eq(2)
      .children()
      .eq(3)
      .should('contain.text', 'Key-Worker, Available-Active2 (allocations: 32)')

    cy.contains('Use the dropdown lists to assign key workers to prisoners or deallocate them.').should('exist')

    cy.contains('Changes will only take affect when you select save').should('exist')

    cy.contains(
      'Select ‘Assign key workers automatically’ to get key worker recommendations for all prisoners without a current key worker.',
    ).should('exist')

    cy.contains('You should save any changes you’ve made before selecting this.').should('exist')

    cy.findByRole('button', { name: 'Assign key workers automatically' }).should('exist')
    cy.findByRole('button', { name: 'Save changes' }).should('exist')
  }

  const checkSorting = () => {
    cy.get('.govuk-table__row').eq(0).children().eq(2).should('contain.text', 'Key worker').children().eq(0).click()

    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'Bar, Foo')
    cy.get('.govuk-table__row').eq(2).children().eq(0).should('contain.text', 'Tester, Jane')
    cy.get('.govuk-table__row').eq(3).children().eq(0).should('contain.text', 'John, Doe')
  }

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/key-worker/recommend-key-workers-automatically', { failOnStatusCode: false })
  }
})
