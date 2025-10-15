import { components } from '../../@types/keyWorker'
import AuthorisedRoles from '../../authentication/authorisedRoles'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'
import { verifyRoleBasedAccess } from '../../../integration_tests/support/roleBasedAccess'
import { checkAxeAccessibility } from '../../../integration_tests/support/accessibilityViolations'

context('/allocate', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
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

  const searchBtn = () => cy.findByRole('button', { name: /Search/i })
  const queryTextbox = () => cy.findByRole('textbox', { name: /Name or prison number/ })
  const locationTextBox = () => cy.findByRole('combobox', { name: /Residential location/ })
  const excludeActiveCheckbox = () => cy.findByRole('checkbox', { name: /Prisoners without a key worker/ })
  const autoAllocateButton = () => cy.findByRole('button', { name: /Assign key workers automatically/i })
  const invalidNameError = 'Enter a valid name or prison number'
  const invalidSearchError = 'Select or enter text into at least one of the search options below'
  const invalidLocationError = 'Select a valid location'

  describe('Role based access', () => {
    it('should deny access to a view only user POSTing to the page', () => {
      cy.task('stubSignIn', {
        roles: [AuthorisedRoles.KEYWORKER_MONITOR, AuthorisedRoles.PERSONAL_OFFICER_VIEW],
      })

      navigateToTestPage()

      cy.verifyPostRedirectsToNotAuthorised({ body: { selectStaffMember: 'G1618UI:allocate:486018' } })
    })

    verifyRoleBasedAccess('/key-worker/allocate', UserPermissionLevel.VIEW)
  })

  it('should only display results table when a filter is used', () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/key-worker/allocate', { failOnStatusCode: false })

    cy.findByRole('heading', { name: /Allocate key workers to prisoners/i }).should('be.visible')
    cy.findByRole('heading', { name: /Search by/i }).should('be.visible')
    autoAllocateButton().should('be.visible')
    searchBtn().should('be.visible')

    queryTextbox().should('exist')
    locationTextBox().should('exist')

    excludeActiveCheckbox().should('exist')

    cy.get('.moj-pagination').should('have.length', 0)
    cy.get('form').should('have.length', 1)
    cy.findByText('You must select or enter text into at least one search option below.').should('be.visible')
    cy.findByText(
      'Select ‘Assign key workers automatically’ to get key worker recommendations for all prisoners without a current key worker.',
    )

    queryTextbox().clear()
    searchBtn().click()

    cy.get('.govuk-error-summary').should('have.length', 1)
    cy.findByText(invalidSearchError)
      .should('exist')
      .should('have.attr', 'href')
      .should('match', /#searchBy$/)

    queryTextbox().type('ALL')
    searchBtn().click()

    // Prisoner profile back link
    cy.get('.govuk-table__row:nth-child(2) > :nth-child(1) > :nth-child(1)')
      .should('have.attr', 'href')
      .should(
        'include',
        'http://localhost:3001/save-backlink?service=allocate-key-workers&redirectPath=%2Fprisoner%2FAAA1234&returnPath=%2Fallocate%3Fquery%3DALL%26cellLocationPrefix%3D%26excludeActiveAllocations%3Dfalse%26js%3Dfalse%26history%3D',
      )

    // Prisoner profile alerts back link
    cy.get('.govuk-table__row:nth-child(2) >:nth-child(3) > :nth-child(1) > :nth-child(2) > :nth-child(1)')
      .should('have.attr', 'href')
      .should(
        'include',
        'http://localhost:3001/save-backlink?service=allocate-key-workers&redirectPath=%2Fprisoner%2FAAA1234%2Falerts%2Factive&returnPath=%2Fallocate%3Fquery%3DALL%26cellLocationPrefix%3D%26excludeActiveAllocations%3Dfalse%26js%3Dfalse%26history%3D',
      )

    checkPageContentsNoFilter()

    checkSorting()
    checkSelectSorting()

    checkPrisonersExcludeActiveAllocationsFilter()

    checkNameOrPrisonNumberFilter()

    checkResidentialLocationFilter()
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
      .find('.dps-alert-status--risk')
      .should('contain', 'No one-to-one')
    getRelevantAlertColumnForRow(1)
      .find('.dps-alert-status--security')
      .should('contain', 'Risk to females')
    getRelevantAlertColumnForRow(1)
      .find('a.govuk-link--no-visited-state')
      .should('contain', '+2 active alerts')
    getRelevantAlertColumnForRow(2)
      .find('.dps-alert-status--risk')
      .should('contain', 'No one-to-one')
    getRelevantAlertColumnForRow(2)
      .find('.dps-alert-status--security')
      .should('contain', 'Risk to females')
    getRelevantAlertColumnForRow(2)
      .find('a.govuk-link--no-visited-state')
      .should('contain', '+1 active alert')
    getRelevantAlertColumnForRow(3)
      .find('.dps-alert-status--risk')
      .should('contain', 'No one-to-one')
    getRelevantAlertColumnForRow(3)
      .find('.dps-alert-status--security')
      .should('contain', 'Risk to females')
    getRelevantAlertColumnForRow(4)
      .find('.dps-alert-status--risk')
      .should('contain', 'No one-to-one')
    getRelevantAlertColumnForRow(4)
      .find('a.govuk-link--no-visited-state')
      .should('contain', '+1 active alert')
    getRelevantAlertColumnForRow(5)
      .find('.dps-alert-status--security')
      .should('contain', 'Risk to females')
    getRelevantAlertColumnForRow(5)
      .find('a.govuk-link--no-visited-state')
      .should('contain', '+1 active alert')
    getRelevantAlertColumnForRow(6)
      .find('a.govuk-link--no-visited-state')
      .should('contain', '1 active alert')
    getRelevantAlertColumnForRow(7)
      .invoke('text')
      .should('match', /^\s+None\s+$/gm)
    getRelevantAlertColumnForRow(8)
      .invoke('text')
      .should('match', /^\s+None\s+$/gm)
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

    cy.visit('/key-worker/allocate?query=<script>alert%28%27inject%27%29<%2Fscript>&cellLocationPrefix=FAKELOCATION', {
      failOnStatusCode: false,
    })
    queryTextbox().should('have.value', `<script>alert('inject')</script>`)
    locationTextBox().should('have.value', '')

    cy.get('.govuk-error-summary').should('have.length', 1)
    cy.findByText(invalidNameError)
      .should('exist')
      .should('have.attr', 'href')
      .should('match', /#query$/)
    cy.findByText(invalidLocationError)
      .should('exist')
      .should('have.attr', 'href')
      .should('match', /#cellLocationPrefix$/)
  })

  it('should show error when no allocations or deallocations are made', () => {
    navigateToTestPage()

    cy.findByRole('button', { name: /Save changes/i }).click()

    cy.findByText('There is a problem').should('be.visible')
    cy.findByRole('link', { name: /Select key workers from the dropdown lists/ })
      .should('be.visible')
      .should('have.attr', 'href')
      .should('match', /#selectStaffMember/)
  })

  it('should preserve queries on submit form validation error', () => {
    navigateToTestPage()
    cy.visit('/key-worker/allocate?excludeActiveAllocations=true', {
      failOnStatusCode: false,
    })

    cy.findByRole('button', { name: /Save changes/i }).click()
    cy.findByRole('link', { name: /Select key workers from the dropdown lists/ }).should('be.visible')

    cy.url().should('match', /\/key-worker\/allocate\?excludeActiveAllocations=true/)
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

    cy.get('.govuk-table__row').should('have.length', 5)
    cy.get('.govuk-table__row').eq(3).children().eq(0).should('contain.text', 'John, Doe')

    cy.get('select').eq(2).focus().should('contain', 'Deallocate')
    cy.get('select').eq(2).should('not.contain', 'Key-Worker, Available-Active (allocations: 32)')

    cy.get('select').eq(1).focus().should('not.contain', 'Deallocate')
    cy.get('select').eq(1).should('contain', 'Key-Worker2, Available-Active (allocations: 32)')
    cy.get('select').eq(3).focus().should('not.contain', 'Deallocate')
    cy.get('select').eq(3).should('contain', 'Key-Worker2, Available-Active (allocations: 32)')

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

  it('should show Save changes button only when there are selected changes', () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/key-worker/allocate?query=ALL&js=true')

    cy.get('select').eq(1).focus()
    cy.get('select').eq(2).focus()

    cy.findByRole('button', { name: /Save changes/i }).should('not.exist')

    cy.get('select').eq(1).select('Key-Worker, Available-Active2 (allocations: 32)')
    cy.get('select').eq(2).select('Key-Worker, Available-Active2 (allocations: 32)')
    cy.findByText('2 changes selected').should('be.visible')
    cy.findByRole('button', { name: /Save changes/i }).should('be.visible')

    cy.findByRole('button', { name: 'Clear' }).click()
    cy.findByRole('button', { name: /Save changes/i }).should('not.exist')

    cy.get('select').eq(1).select('Key-Worker, Available-Active2 (allocations: 32)')
    cy.findByText('1 change selected').should('be.visible')
    cy.findByRole('button', { name: /Save changes/i }).should('be.visible')
  })

  describe('Dropdown', () => {
    const mockKeyworkers = [
      { firstName: 'BFirstName', lastName: 'BLastName', staffId: 488021, allocated: 1 },
      { firstName: 'ZFirstName', lastName: 'ALastName', staffId: 488022, allocated: 2 },
      { firstName: 'XFirstName', lastName: 'ALastName', staffId: 488023, allocated: 1 },
      { firstName: 'CFirstName', lastName: 'CLastName', staffId: 488024, allocated: 4 },
      { firstName: 'AFirstName', lastName: 'ALastName', staffId: 488025, allocated: 5 },
    ]

    const jsStates = [true, false]
    const sortOrders = {
      name: [
        'Alastname, Afirstname (allocations: 5)',
        'Alastname, Xfirstname (allocations: 1)',
        'Alastname, Zfirstname (allocations: 2)',
        'Blastname, Bfirstname (allocations: 1)',
        'Clastname, Cfirstname (allocations: 4)',
      ],
      allocations: [
        'Alastname, Xfirstname (allocations: 1)',
        'Blastname, Bfirstname (allocations: 1)',
        'Alastname, Zfirstname (allocations: 2)',
        'Clastname, Cfirstname (allocations: 4)',
        'Alastname, Afirstname (allocations: 5)',
      ],
    }

    Object.keys(sortOrders).forEach(sort => {
      jsStates.forEach(js => {
        it(`should sort dropdowns by ${sort} (${js ? 'client side JS' : 'no JS'})`, () => {
          cy.task('stubSearchAllocatableStaff', mockKeyworkers)
          cy.signIn({ failOnStatusCode: false })

          if (sort === 'name') {
            cy.task('stubKeyworkerPrisonConfigNameSort')
          }

          cy.visitWithHistory(`/key-worker/allocate?query=ALL&js=${js}`, ['/key-worker'])

          if (js) {
            // Nunjucks prepopulates with one item (or two if on recommend allocations page) and then JS populates the rest on focus
            cy.get('.placeholder-select').eq(1).children().should('have.length', 1)
            cy.get('.placeholder-select').eq(1).focus()
          }

          cy.get('.placeholder-select').eq(0).focus().children().should('have.length', 6)
          // Includes deallocate
          cy.get('.placeholder-select').eq(1).children().should('have.length', 7)

          const getOption = (index: number) => cy.get('#selectStaffMember').eq(0).children().eq(index)

          // @ts-expect-error index is known
          sortOrders[sort].forEach((text, index) => getOption(index + 1).should('contain.text', text))
        })
      })
    })
  })

  const checkPageContentsNoFilter = (readonly = false, allowAutoAllocation = true) => {
    cy.title().should('equal', 'Allocate key workers to prisoners - Key workers - DPS')
    cy.findByRole('heading', { name: /Allocate key workers to prisoners/i }).should('be.visible')
    cy.findByRole('heading', { name: /Search by/i }).should('be.visible')
    searchBtn().should('be.visible')

    queryTextbox().should('exist')
    locationTextBox().should('exist')

    excludeActiveCheckbox().should('exist')

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
    cy.findByRole('link', { name: 'Key-Worker, Available-Active (allocations: 1)' })
      .should('have.attr', 'href')
      .should('match', /staff-profile\/488095/)

    cy.get('.govuk-table__row')
      .eq(3)
      .children()
      .eq(readonly ? 4 : 5)
      .should('contain.text', 'View allocation history')
      .children()
      .eq(0)
      .should('have.attr', 'href')
      .should('match', /key-worker\/prisoner-allocation-history\/A4288DZ/)

    if (!readonly) {
      cy.get('.govuk-table__row:nth-child(4) > :nth-child(5) > :nth-child(1) > :nth-child(1)')
        .focus()
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

    autoAllocateButton().should(readonly || !allowAutoAllocation ? 'not.exist' : 'exist')

    if (!readonly && allowAutoAllocation) {
      autoAllocateButton()
        .should('have.attr', 'href')
        .should('match', /key-worker\/recommend-allocations/)
    }

    cy.findByRole('button', { name: 'Save changes' }).should(readonly ? 'not.exist' : 'exist')
  }

  const checkPrisonersExcludeActiveAllocationsFilter = (readonly = false) => {
    queryTextbox().clear()
    excludeActiveCheckbox().check()
    searchBtn().click()

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
        .should('contain.text', 'Key-Worker2, Available-Active (allocations: 32)')
    }

    cy.get('.govuk-table__row')
      .eq(1)
      .children()
      .eq(readonly ? 4 : 5)
      .should('contain.text', 'View allocation history')
      .children()
      .eq(0)
      .should('have.attr', 'href')
      .should('match', /key-worker\/prisoner-allocation-history\/A2504EA/)

    cy.get('.govuk-table__row').eq(3).children().eq(0).should('contain.text', 'Tester, Jane')
    cy.get('.govuk-table__row').eq(3).children().eq(1).should('contain.text', '4-2-031')
    cy.get('.govuk-table__row').eq(3).children().eq(3).should('contain.text', 'None')

    if (!readonly) {
      cy.get('.govuk-table__row:nth-child(3) > :nth-child(5) > :nth-child(1) > :nth-child(1)')
        .focus()
        .should('contain.text', 'Key-Worker2, Available-Active (allocations: 32)')
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

  const checkSelectSorting = () => {
    cy.get('#selectStaffMember')
      .eq(0)
      .children()
      .eq(1)
      .should('contain.text', 'Key-Worker, Available-Active2 (allocations: 32)')
    cy.get('#selectStaffMember')
      .eq(0)
      .children()
      .eq(2)
      .should('contain.text', 'Key-Worker2, Available-Active (allocations: 32)')
  }

  const checkResidentialLocationFilter = (readonly = false) => {
    queryTextbox().clear()
    locationTextBox().select('Houseblock 3')
    searchBtn().click()

    cy.get('.moj-pagination').should('have.length', 2).eq(0).should('contain.text', 'Showing 1 to 1 of 1 result')

    cy.get('.govuk-table__row').should('have.length', 2)
    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'Bar, Foo')
    cy.get('.govuk-table__row')
      .eq(1)
      .children()
      .eq(readonly ? 4 : 5)
      .children()
      .eq(0)
      .should('have.attr', 'href')
      .should('match', /key-worker\/prisoner-allocation-history\/A2504EA/)
  }

  const checkNameOrPrisonNumberFilter = (readonly = false) => {
    excludeActiveCheckbox().uncheck()
    queryTextbox().clear().type('John')
    searchBtn().click()

    cy.get('.moj-pagination').should('have.length', 2).eq(0).should('contain.text', 'Showing 1 to 1 of 1 result')

    cy.get('.govuk-table__row').should('have.length', 2)
    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'John, Doe')
    cy.get('.govuk-table__row')
      .eq(1)
      .children()
      .eq(readonly ? 4 : 5)
      .children()
      .eq(0)
      .should('have.attr', 'href')
      .should('match', /key-worker\/prisoner-allocation-history\/A4288DZ/)
  }

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/key-worker/allocate?query=ALL', { failOnStatusCode: false })
    checkAxeAccessibility()
  }
})
