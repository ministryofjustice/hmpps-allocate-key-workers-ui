import { components } from '../../@types/keyWorker'
import AuthorisedRoles from '../../authentication/authorisedRoles'

context('/allocate', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn', {
      roles: [AuthorisedRoles.OMIC_ADMIN, AuthorisedRoles.KEYWORKER_MONITOR, AuthorisedRoles.KW_MIGRATION],
    })
    cy.task('stubEnabledPrison')
    cy.task('stubResidentialHierarchy')
    cy.task('stubSearchPrisonersWithQuery')
    cy.task('stubSearchPrisonersWithLocation')
    cy.task('stubSearchPrisoner')
    cy.task('stubSearchAllocatableStaffAll')
    cy.task('stubSearchPrisonersWithExcludeAllocations')
    cy.task('stubSearchAllocatableStaffStatusActive')
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

  it('should handle all sorting cases for alerts', () => {
    const prisonerBase = {
      personIdentifier: 'A2504EA',
      firstName: 'FOO',
      lastName: 'BAR',
      location: '3-1-027',
      hasHighComplexityOfNeeds: false,
      hasAllocationHistory: true,
      relevantAlertCodes: ['XRF', 'RNO121'],
      remainingAlertCount: 1,
    }

    const prisonersWithAlertCodes = [
      {
        ...prisonerBase,
      },
      {
        ...prisonerBase,
        remainingAlertCount: 2,
      },
      {
        ...prisonerBase,
        remainingAlertCount: 0,
      },
      {
        ...prisonerBase,
        relevantAlertCodes: ['XRF'],
        remainingAlertCount: 1,
      },
      {
        ...prisonerBase,
        relevantAlertCodes: ['RNO121'],
        remainingAlertCount: 1,
      },
      {
        ...prisonerBase,
        relevantAlertCodes: [],
        remainingAlertCount: 1,
      },
      {
        ...prisonerBase,
        lastName: 'ZSorted',
        relevantAlertCodes: [],
        remainingAlertCount: 0,
      },
      {
        ...prisonerBase,
        lastName: 'ASorted',
        relevantAlertCodes: [],
        remainingAlertCount: 0,
      },
    ]

    cy.task('stubSearchPrisoner', prisonersWithAlertCodes as components['schemas']['PersonSearchResponse']['content'])
    navigateToTestPage()

    const getRelevantAlertColumnForRow = (rowIndex: number) =>
      cy.get('.govuk-table__row').eq(rowIndex).children().eq(2).children().eq(0)

    cy.get('.govuk-table__row')
      .eq(0)
      .children()
      .eq(2)
      .should('contain.text', 'Relevant alerts')
      .children()
      .eq(0)
      .click()

    getRelevantAlertColumnForRow(1)
      .invoke('text')
      .should('match', /^\s+Risk to females\s+No one-to-one\s+\+2 active alerts\s+$/gm)
    getRelevantAlertColumnForRow(2)
      .invoke('text')
      .should('match', /^\s+Risk to females\s+No one-to-one\s+\+1 active alert\s+$/gm)
    getRelevantAlertColumnForRow(3)
      .invoke('text')
      .should('match', /^\s+Risk to females\s+No one-to-one\s+$/gm)
    getRelevantAlertColumnForRow(4)
      .invoke('text')
      .should('match', /^\s+No one-to-one\s+\+1 active alert\s+$/gm)
    getRelevantAlertColumnForRow(5)
      .invoke('text')
      .should('match', /^\s+Risk to females\s+\+1 active alert\s+$/gm)
    getRelevantAlertColumnForRow(6)
      .invoke('text')
      .should('match', /^\s+1 active alert\s+$/gm)
    getRelevantAlertColumnForRow(7)
      .invoke('text')
      .should('match', /^\s+None\s+$/gm)
    getRelevantAlertColumnForRow(8)
      .invoke('text')
      .should('match', /^\s+None\s+$/gm)
  })

  it('should load read-only page correctly', () => {
    cy.task('stubSignIn', {
      roles: [AuthorisedRoles.KEYWORKER_MONITOR],
    })

    navigateToTestPage()

    checkPageContentsNoFilter(true)

    checkSorting()

    checkPrisonersExcludeActiveAllocationsFilter(true)

    checkNameOrPrisonNumberFilter(true)

    checkResidentialLocationFilter(true)
  })

  it('should load page correctly when prison has auto allocation disabled', () => {
    cy.task('stubKeyworkerPrisonConfigNoAutoAllocation')

    navigateToTestPage()

    checkPageContentsNoFilter(false, false)

    checkSorting()

    checkPrisonersExcludeActiveAllocationsFilter()

    checkNameOrPrisonNumberFilter()

    checkResidentialLocationFilter()
  })

  it('should handle invalid queries', () => {
    navigateToTestPage()

    cy.visit('/key-worker/allocate?query=<script>alert%28%27inject%27%29<%2Fscript>', {
      failOnStatusCode: false,
    })
    cy.findByRole('textbox', { name: /Name or prison number/ }).should('have.value', '')
    cy.get('.govuk-table__row').should('have.length', 5)

    cy.visit('/key-worker/allocate?cellLocationPrefix=<script>alert%28%27inject%27%29<%2Fscript>', {
      failOnStatusCode: false,
    })
    cy.findByRole('combobox', { name: /Residential location/ }).should('have.value', '')
    cy.get('.govuk-table__row').should('have.length', 5)
  })

  it('should show error when no allocations or deallocations are made', () => {
    navigateToTestPage()

    cy.findByRole('button', { name: /Save changes/i }).click()

    cy.findByText('There is a problem').should('be.visible')
    cy.findByRole('link', { name: /Select key workers from the dropdown lists/ })
      .should('be.visible')
      .should('have.attr', 'href', '#selectStaffMember')
  })

  it('should preserve queries on submit form validation error', () => {
    navigateToTestPage()
    cy.visit('/key-worker/allocate?excludeActiveAllocations=true', {
      failOnStatusCode: false,
    })

    cy.findByRole('button', { name: /Save changes/i }).click()
    cy.findByRole('link', { name: /Select key workers from the dropdown lists/ }).should('be.visible')

    cy.url().should('match', /\/key-worker\/allocate\?excludeActiveAllocations=true#$/)
  })

  it('should show error on de/allocation failure (500)', () => {
    cy.task('stubPutAllocationFail500')
    navigateToTestPage()

    cy.visit('/key-worker/allocate?query=John', { failOnStatusCode: false })

    cy.get('.govuk-table__row').should('have.length', 2)
    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'John, Doe')

    cy.get('#selectStaffMember').select('Deallocate')

    cy.findByRole('button', { name: /Save changes/i }).click()

    cy.findByText('Sorry, there is a problem with the service').should('exist')
  })

  it('should show error on de/allocation failure (400)', () => {
    cy.task('stubPutAllocationFail400')
    navigateToTestPage()

    cy.visit('/key-worker/allocate?query=John', { failOnStatusCode: false })

    cy.get('.govuk-table__row').should('have.length', 2)
    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'John, Doe')

    cy.get('#selectStaffMember').select('Deallocate')

    cy.findByRole('button', { name: /Save changes/i }).click()

    cy.verifyLastAPICall(
      { method: 'PUT' },
      {
        allocations: [],
        deallocations: [{ personIdentifier: 'A4288DZ', staffId: 488095, deallocationReason: 'MANUAL' }],
      },
    )

    cy.findByText('There is a problem').should('exist')
    cy.get('.moj-alert').should('not.exist')
  })

  it('should show success message on deallocation', () => {
    cy.task('stubPutAllocationSuccess')
    cy.task('stubPutDeallocationSuccess')
    navigateToTestPage()

    cy.visit('/key-worker/allocate?query=John', { failOnStatusCode: false })

    cy.get('.govuk-table__row').should('have.length', 2)
    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'John, Doe')

    cy.get('#selectStaffMember').should('contain', 'Select key worker')
    cy.get('#selectStaffMember').should('contain', 'Deallocate')
    cy.get('#selectStaffMember').should('not.contain', 'Key-Worker, Available-Active (allocations: 32)')
    cy.get('#selectStaffMember').select('Deallocate')

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

    cy.visit('/key-worker/allocate', { failOnStatusCode: false })

    cy.get('.govuk-table__row').should('have.length', 5)
    cy.get('.govuk-table__row').eq(3).children().eq(0).should('contain.text', 'John, Doe')

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

  const checkPageContentsNoFilter = (readonly = false, allowAutoAllocation = true) => {
    cy.title().should('equal', 'Allocate key workers to prisoners - Key workers - DPS')
    cy.findByRole('heading', { name: /Allocate key workers to prisoners/i }).should('be.visible')
    cy.findByRole('heading', { name: /Filter by/i }).should('be.visible')
    cy.findByRole('button', { name: /Apply filters/i }).should('be.visible')
    cy.findByRole('link', { name: /Clear/i }).should('be.visible').should('have.attr', 'href', '?clear=true')

    cy.findByRole('textbox', { name: /Name or prison number/ }).should('exist')
    cy.findByRole('combobox', { name: /Residential location/ }).should('exist')

    cy.findByRole('checkbox', { name: /Prisoners without a key worker/ }).should('exist')

    cy.get('.moj-pagination').should('have.length', 2).eq(0).should('contain.text', 'Showing 1 to 4 of 4 results')

    cy.get('.govuk-table__row').should('have.length', 5)
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
      .should('contain.text', 'Relevant alerts')
      .children()
      .should('have.length', 1)
    cy.get('.govuk-table__row')
      .eq(0)
      .children()
      .eq(3)
      .should('contain.text', 'Key worker')
      .children()
      .should('have.length', 1)
    cy.get('.govuk-table__row')
      .eq(0)
      .children()
      .should('have.length', readonly ? 5 : 6)

    if (!readonly) {
      cy.get('.govuk-table__row')
        .eq(0)
        .children()
        .eq(4)
        .should('contain.text', 'Change key worker')
        .children()
        .should('have.length', 0)
    }

    cy.get('.govuk-table__row')
      .eq(0)
      .children()
      .eq(readonly ? 4 : 5)
      .should('contain.text', '')
      .children()
      .should('have.length', 0)

    cy.get('.govuk-table__row').eq(3).children().eq(0).should('contain.text', 'John, Doe')
    cy.get('.govuk-table__row').eq(3).children().eq(1).should('contain.text', '1-1-035')
    cy.get('.govuk-table__row').eq(3).children().eq(3).should('contain.text', 'Key-Worker, Available-Active')
    cy.findByRole('link', { name: 'Key-Worker, Available-Active' }).should('have.attr', 'href', 'staff-profile/488095')

    cy.get('.govuk-table__row')
      .eq(3)
      .children()
      .eq(readonly ? 4 : 5)
      .should('contain.text', 'View allocation history')
      .children()
      .eq(0)
      .should('have.attr', 'href', '/key-worker/prisoner-allocation-history/A4288DZ')

    if (!readonly) {
      cy.get('.govuk-table__row')
        .eq(3)
        .children()
        .eq(4)
        .should('contain.text', 'Key-Worker, Available-Active2 (allocations: 32)')
    }

    cy.contains('Use the dropdown lists to assign key workers to prisoners or deallocate them.').should(
      readonly ? 'not.exist' : 'exist',
    )

    cy.contains('Changes will only take affect when you select save').should(readonly ? 'not.exist' : 'exist')

    cy.contains(
      'Select ‘Assign key workers automatically’ to get key worker recommendations for all prisoners without a current key worker.',
    ).should(readonly || !allowAutoAllocation ? 'not.exist' : 'exist')

    cy.contains('You should save any changes you’ve made before selecting this.').should(
      readonly || !allowAutoAllocation ? 'not.exist' : 'exist',
    )

    cy.findByRole('button', { name: 'Assign key workers automatically' }).should(
      readonly || !allowAutoAllocation ? 'not.exist' : 'exist',
    )
    cy.findByRole('button', { name: 'Save changes' }).should(readonly ? 'not.exist' : 'exist')
  }

  const checkPrisonersExcludeActiveAllocationsFilter = (readonly = false) => {
    cy.findByRole('checkbox', { name: /Prisoners without a key worker/ }).check()
    cy.findByRole('button', { name: /Apply filters/i }).click()

    cy.get('.moj-pagination').should('have.length', 2).eq(0).should('contain.text', 'Showing 1 to 3 of 3 results')

    cy.get('.govuk-table__row').should('have.length', 4)
    cy.get('.govuk-table__row')
      .eq(1)
      .children()
      .should('have.length', readonly ? 5 : 6)
    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'Bar, Foo')
    cy.get('.govuk-table__row').eq(1).children().eq(1).should('contain.text', '3-1-027')
    cy.get('.govuk-table__row').eq(1).children().eq(2).should('contain.text', '-')

    if (!readonly) {
      cy.get('.govuk-table__row')
        .eq(1)
        .children()
        .eq(4)
        .should('contain.text', 'Key-Worker, Available-Active (allocations: 32)')
    }

    cy.get('.govuk-table__row')
      .eq(1)
      .children()
      .eq(readonly ? 4 : 5)
      .should('contain.text', 'View allocation history')
      .children()
      .eq(0)
      .should(
        'have.attr',
        'href',
        '/key-worker/prisoner-allocation-history/A2504EA?query=&cellLocationPrefix=&excludeActiveAllocations=true',
      )

    cy.get('.govuk-table__row').eq(3).children().eq(0).should('contain.text', 'Tester, Jane')
    cy.get('.govuk-table__row').eq(3).children().eq(1).should('contain.text', '4-2-031')
    cy.get('.govuk-table__row').eq(3).children().eq(3).should('contain.text', 'None')

    if (!readonly) {
      cy.get('.govuk-table__row')
        .eq(3)
        .children()
        .eq(4)
        .should('contain.text', 'Key-Worker, Available-Active (allocations: 32)')
    }

    cy.get('.govuk-table__row')
      .eq(3)
      .children()
      .eq(readonly ? 4 : 5)
      .should('not.contain.text', 'View allocation history')
  }

  const checkSorting = () => {
    cy.get('.govuk-table__row').eq(0).children().eq(3).should('contain.text', 'Key worker').children().eq(0).click()
    cy.get('.govuk-table__row').eq(0).children().eq(3).should('contain.text', 'Key worker').children().eq(0).click()

    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'Bar, Foo')
    cy.get('.govuk-table__row').eq(2).children().eq(0).should('contain.text', 'Complexity-Needs, High')
    cy.get('.govuk-table__row').eq(3).children().eq(0).should('contain.text', 'Tester, Jane')
    cy.get('.govuk-table__row').eq(4).children().eq(0).should('contain.text', 'John, Doe')
  }

  const checkResidentialLocationFilter = (readonly = false) => {
    cy.findByRole('textbox', { name: /Name or prison number/ }).clear()
    cy.findByRole('combobox', { name: /Residential location/ }).select('Houseblock 3')
    cy.findByRole('button', { name: /Apply filters/i }).click()

    cy.get('.moj-pagination').should('have.length', 2).eq(0).should('contain.text', 'Showing 1 to 1 of 1 result')

    cy.get('.govuk-table__row').should('have.length', 2)
    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'Bar, Foo')
    cy.get('.govuk-table__row')
      .eq(1)
      .children()
      .eq(readonly ? 4 : 5)
      .children()
      .eq(0)
      .should(
        'have.attr',
        'href',
        '/key-worker/prisoner-allocation-history/A2504EA?query=&cellLocationPrefix=3&excludeActiveAllocations=false',
      )
  }

  const checkNameOrPrisonNumberFilter = (readonly = false) => {
    cy.findByRole('checkbox', { name: /Prisoners without a key worker/ }).uncheck()
    cy.findByRole('textbox', { name: /Name or prison number/ })
      .clear()
      .type('John')
    cy.findByRole('button', { name: /Apply filters/i }).click()

    cy.get('.moj-pagination').should('have.length', 2).eq(0).should('contain.text', 'Showing 1 to 1 of 1 result')

    cy.get('.govuk-table__row').should('have.length', 2)
    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'John, Doe')
    cy.get('.govuk-table__row')
      .eq(1)
      .children()
      .eq(readonly ? 4 : 5)
      .children()
      .eq(0)
      .should(
        'have.attr',
        'href',
        '/key-worker/prisoner-allocation-history/A4288DZ?query=John&cellLocationPrefix=&excludeActiveAllocations=false',
      )
  }

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/key-worker/allocate', { failOnStatusCode: false })
  }
})
