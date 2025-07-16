import { verifyRoleBasedAccess } from '../../../integration_tests/support/roleBasedAccess'
import AuthorisedRoles from '../../authentication/authorisedRoles'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'

context('/recommend-allocations', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn', {
      roles: [AuthorisedRoles.OMIC_ADMIN, AuthorisedRoles.KEYWORKER_MONITOR, AuthorisedRoles.KW_MIGRATION],
    })
    cy.task('stubEnabledPrison')
    cy.task('stubResidentialHierarchy')
    cy.task('stubSearchPrisoner')
    cy.task('stubSearchAllocatableStaffAll')
    cy.task('stubSearchPrisonersWithExcludeAllocations')
    cy.task('stubSearchAllocatableStaffStatusActive')
    cy.task('stubAllocationRecommendations', {
      allocations: [
        {
          personIdentifier: 'A2504EA',
          location: 'COURT',
          staff: {
            staffId: 488095,
            firstName: 'UNAVAILABLE',
            lastName: 'ANNUAL-LEAVE',
            status: { code: 'UNA', description: 'Unavailable - annual leave' },
            capacity: 1,
            allocated: 1,
            allowAutoAllocation: true,
          },
        },
      ],
      noAvailableStaffFor: [{ personIdentifier: 'A2504EA', location: 'COURT' }],
      staff: [
        {
          staffId: 488096,
          firstName: 'AVAILABLE',
          lastName: 'ACTIVE',
          status: { code: 'ACT', description: 'Active' },
          capacity: 1,
          allocated: 0,
          allowAutoAllocation: true,
        },
      ],
    })
  })

  describe('Role based access', () => {
    verifyRoleBasedAccess('/key-worker/recommend-allocations', UserPermissionLevel.ALLOCATE)
  })

  it('should load page correctly', () => {
    navigateToTestPage()

    checkPageContents()

    checkSorting()
  })

  it('should redirect to home page when the prison has auto allocation disabled', () => {
    cy.task('stubKeyworkerPrisonConfigNoAutoAllocation')
    navigateToTestPage()

    cy.url().should('match', /\/key-worker$/)
  })

  it('should show an "All prisoners assigned" message when there are no prisoners to allocate', () => {
    cy.task('stubAllocationRecommendations', {
      allocations: [],
      noAvailableStaffFor: [],
      staff: [],
    })

    cy.signIn({ failOnStatusCode: false })
    cy.visit(`/key-worker/recommend-allocations`, { failOnStatusCode: false })

    cy.findByRole('heading', { name: /Allocate key workers automatically/i }).should('be.visible')
    cy.findByText('All prisoners currently have a key worker assigned.').should('exist')

    cy.get('.moj-pagination').should('have.length', 0)
    cy.get('.govuk-table__row').should('have.length', 0)
  })

  it('should show error when no allocations or deallocations are made', () => {
    navigateToTestPage()

    cy.get('.govuk-select').eq(0).select('Select key worker')
    cy.findByRole('button', { name: /Save changes/i }).click()

    cy.findByText('There is a problem').should('be.visible')
    cy.findByRole('link', { name: /Select key workers from the dropdown lists/ })
      .should('be.visible')
      .should('have.attr', 'href', '#selectStaffMember')
  })

  it('should show error on de/allocation failure', () => {
    cy.task('stubPutAllocationFail500')
    navigateToTestPage()

    cy.get('.govuk-table__row').should('have.length', 3)
    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'Bar, Foo')

    cy.findByRole('button', { name: /Save changes/i }).click()

    cy.verifyLastAPICall(
      { method: 'PUT' },
      {
        allocations: [{ personIdentifier: 'A2504EA', staffId: 488095, allocationReason: 'AUTO' }],
        deallocations: [],
      },
    )

    cy.findByText('Sorry, there is a problem with the service').should('exist')
  })

  it('should show success message on allocation', () => {
    cy.task('stubPutAllocationRecommendationSuccess')
    navigateToTestPage()

    cy.get('select').eq(1).select('Active, Available (allocations: 0)')

    cy.findByRole('button', { name: /Save changes/i }).click()

    cy.verifyLastAPICall(
      { method: 'PUT' },
      {
        allocations: [
          { personIdentifier: 'A2504EA', staffId: 488095, allocationReason: 'AUTO' },
          { personIdentifier: 'G7189VT', staffId: 488096, allocationReason: 'MANUAL' },
        ],
        deallocations: [],
      },
    )

    cy.get('.moj-alert').should('contain.text', 'Changes made successfully')

    cy.url().should('match', /\/allocate$/)
    cy.findByText('You have successfully allocated key workers to 2 prisoners.').should('exist')
  })

  it('should show success message on allocation - singular staff', () => {
    cy.task('stubAllocationRecommendations', {
      allocations: [
        {
          personIdentifier: 'A2504EA',
          location: 'COURT',
          staff: {
            staffId: 488096,
            firstName: 'AVAILABLE',
            lastName: 'ACTIVE',
            status: { code: 'ACT', description: 'Active' },
            capacity: 1,
            allocated: 0,
            allowAutoAllocation: true,
          },
        },
      ],
      staff: [
        {
          staffId: 488096,
          firstName: 'AVAILABLE',
          lastName: 'ACTIVE',
          status: { code: 'ACT', description: 'Active' },
          capacity: 1,
          allocated: 0,
          allowAutoAllocation: true,
        },
      ],
    })
    cy.task('stubPutAllocationRecommendationSuccess')
    navigateToTestPage()

    cy.get('select').eq(1).select('Active, Available (allocations: 0)')
    cy.findByRole('button', { name: /Save changes/i }).click()

    cy.url().should('match', /\/allocate$/)
    cy.findByText('You have successfully allocated a key worker to 2 prisoners.').should('exist')
  })

  it('should show success message on allocation - singular prisoner', () => {
    cy.task('stubPutAllocationRecommendationSuccess')
    navigateToTestPage()

    cy.findByRole('button', { name: /Save changes/i }).click()

    cy.url().should('match', /\/allocate$/)
    cy.findByText('You have successfully allocated a key worker to 1 prisoner.').should('exist')
  })

  it('should show error message when no capacity is available for auto allocation', () => {
    cy.task('stubAllocationRecommendations', {
      allocations: [],
      noAvailableStaffFor: [{ personIdentifier: 'A2504EA', location: 'COURT' }],
      staff: [],
    })
    navigateToTestPage()
    cy.url().should('match', /\/allocate$/)
    cy.findByRole('heading', { name: 'Not enough available capacity to assign any key workers' }).should('be.visible')
    cy.findByText(
      'Key workers could not be recommended for any prisoners who do not currently have a key worker. This is because none of your key workers have available capacity.',
    ).should('exist')
  })

  const checkPageContents = () => {
    cy.findByRole('heading', { name: /Allocate key workers automatically/i }).should('be.visible')

    cy.get('.moj-pagination').should('have.length', 2).eq(0).should('contain.text', 'Showing 1 to 2 of 2 results')

    cy.should('not.contain.text', 'Complexity-Needs, High')

    cy.get('.govuk-table__row').should('have.length', 3)
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
    cy.get('.govuk-table__row').eq(0).children().should('have.length', 6)

    cy.get('.govuk-table__row')
      .eq(0)
      .children()
      .eq(4)
      .should('contain.text', 'Change key worker')
      .children()
      .should('have.length', 0)

    cy.get('.govuk-table__row').eq(0).children().eq(4).should('contain.text', '').children().should('have.length', 0)

    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'Bar, Foo')
    cy.get('.govuk-table__row').eq(1).children().eq(1).should('contain.text', '3-1-027')
    cy.get('.govuk-table__row').eq(1).children().eq(3).should('contain.text', 'None')

    cy.get('.govuk-table__row')
      .eq(1)
      .children()
      .eq(5)
      .should('contain.text', 'View allocation history')
      .children()
      .eq(0)
      .should('have.attr', 'href', '/key-worker/prisoner-allocation-history/A2504EA')

    cy.get('.govuk-table__row')
      .eq(1)
      .children()
      .eq(4)
      .should('contain.text', 'Annual-Leave, Unavailable (allocations: 1)')

    cy.get('select').eq(0).should('contain.text', 'Annual-Leave, Unavailable (allocations: 1)')
    cy.get('select').eq(0).should('contain.text', 'Active, Available (allocations: 0)')

    // Only the first prisoner should have the unavailable keyworker selectable as this is the recommendation
    cy.get('select').eq(1).should('not.contain.text', 'Annual-Leave, Unavailable (allocations: 1)')
    cy.get('select').eq(1).should('contain.text', 'Active, Available (allocations: 0)')

    cy.get('.govuk-select').should('have.value', 'A2504EA:allocate:488095:auto')

    cy.contains(
      'Key workers have been recommended for the prisoners listed below without a current key worker. Only key workers with an active status have been recommended.',
    ).should('exist')

    cy.contains('These recommendations prioritise key workers who have:').should('exist')
    cy.contains('previously been assigned to a specific prisoner').should('exist')
    cy.contains('the most available capacity').should('exist')
    cy.contains('You can change these by selecting alternative key workers from the dropdown menus.').should('exist')
    cy.contains('Key workers will only be allocated to prisoners when you select save.').should('exist')

    cy.findByRole('button', { name: 'Save changes' }).should('exist')

    const getRelevantAlertColumnForRow = (rowIndex: number) =>
      cy.get('.govuk-table__row').eq(rowIndex).children().eq(2).children().eq(0)

    getRelevantAlertColumnForRow(1)
      .invoke('text')
      .should('match', /^\s+Risk to females\s+No one-to-one\s+\+1 active alert\s+$/gm)
    getRelevantAlertColumnForRow(2)
      .invoke('text')
      .should('match', /^\s+Risk to females\s+No one-to-one\s+\+1 active alert\s+$/gm)
  }

  const checkSorting = () => {
    cy.get('.govuk-table__row')
      .eq(0)
      .children()
      .eq(0)
      .should('contain.text', 'Name and prisoner number')
      .children()
      .eq(0)
      .click()

    cy.get('.govuk-table__row').eq(2).children().eq(0).should('contain.text', 'Bar, Foo')
    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'Tester, Jane')
  }

  const navigateToTestPage = (allowPartialAllocation: boolean = true) => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(`/key-worker/recommend-allocations?allowPartialAllocation=${allowPartialAllocation}`, {
      failOnStatusCode: false,
    })
  }
})
