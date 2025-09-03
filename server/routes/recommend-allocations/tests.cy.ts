import { verifyRoleBasedAccess } from '../../../integration_tests/support/roleBasedAccess'
import AuthorisedRoles from '../../authentication/authorisedRoles'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'
import { historyToBase64 } from '../../utils/testUtils'

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

    cy.url().should('match', /\/key-worker\?history/)
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
    cy.findByText('All prisoners currently have a key worker assigned.').should('be.visible')

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
      .should('have.attr', 'href')
      .should('match', /#selectStaffMember$/)
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

    cy.get('select').eq(1).focus()
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

    cy.url().should('match', /\/allocate/)
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

    cy.get('select').eq(1).focus()
    cy.get('select').eq(1).select('Active, Available (allocations: 0)')
    cy.findByRole('button', { name: /Save changes/i }).click()

    cy.url().should('match', /\/allocate/)
    cy.findByText('You have successfully allocated a key worker to 2 prisoners.').should('exist')
  })

  it('should show success message on allocation - singular prisoner', () => {
    cy.task('stubPutAllocationRecommendationSuccess')
    navigateToTestPage()

    cy.findByRole('button', { name: /Save changes/i }).click()

    cy.url().should('match', /\/allocate/)
    cy.findByText('You have successfully allocated a key worker to 1 prisoner.').should('exist')
  })

  it('should show error message when no capacity is available for auto allocation', () => {
    cy.task('stubAllocationRecommendations', {
      allocations: [],
      noAvailableStaffFor: [{ personIdentifier: 'A2504EA', location: 'COURT' }],
      staff: [],
    })
    navigateToTestPage()
    cy.url().should('match', /\/allocate/)
    cy.findByRole('heading', { name: 'Not enough available capacity to assign any key workers' }).should('be.visible')
    cy.findByText(
      'Key workers could not be recommended for any prisoners who do not currently have a key worker. This is because none of your key workers have available capacity.',
    ).should('exist')
  })

  describe('JS Dropdown', () => {
    it('should populate dropdowns through nunjucks when client side JS is disabled', () => {
      navigateToTestPage(true, false)

      cy.get('.placeholder-select').eq(1).children().should('have.length', 2)
    })

    it('should populate dropdowns through client side JS when available', () => {
      navigateToTestPage(true, true)
      // Nunjucks prepopulates with one item (or two if on recommend allocations page) and then JS populates the rest on focus
      cy.get('.placeholder-select').eq(1).children().should('have.length', 1)
      cy.get('.placeholder-select').eq(1).focus()
      cy.get('.placeholder-select').eq(1).children().should('have.length', 2)
    })
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
      .should('have.attr', 'href')
      .should('match', /\/key-worker\/prisoner-allocation-history\/A2504EA/)

    cy.get('.govuk-table__row')
      .eq(1)
      .children()
      .eq(4)
      .should('contain.text', 'Annual-Leave, Unavailable (allocations: 1)')

    cy.get('select').eq(0).should('contain.text', 'Annual-Leave, Unavailable (allocations: 1)')
    cy.get('select').eq(0).should('contain.text', 'Active, Available (allocations: 0)')

    // Only the first prisoner should have the unavailable keyworker selectable as this is the recommendation
    cy.get('select').eq(1).focus()
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

    // Prisoner profile back link
    cy.get('.govuk-table__row:nth-child(2) > :nth-child(1) > :nth-child(1)')
      .should('have.attr', 'href')
      .should(
        'equal',
        'http://localhost:3001/save-backlink?service=allocate-key-workers&redirectPath=%2Fprisoner%2FG7189VT&returnPath=%2Frecommend-allocations%3FallowPartialAllocation%3Dtrue%26js%3Dtrue%26history%3DWyIva2V5LXdvcmtlciIsIi9rZXktd29ya2VyL2FsbG9jYXRlIiwiL2tleS13b3JrZXIvYWxsb2NhdGU%252FcXVlcnk9JmNlbGxMb2NhdGlvblByZWZpeD0xJmV4Y2x1ZGVBY3RpdmVBbGxvY2F0aW9ucz10cnVlIiwiL2tleS13b3JrZXIvcmVjb21tZW5kLWFsbG9jYXRpb25zIl0%253D',
      )

    // Prisoner profile alerts back link
    cy.get('.govuk-table__row:nth-child(2) >:nth-child(3) > :nth-child(1) > :nth-child(2) > :nth-child(1)')
      .should('have.attr', 'href')
      .should(
        'equal',
        'http://localhost:3001/save-backlink?service=allocate-key-workers&redirectPath=%2Fprisoner%2FG7189VT%2Falerts%2Factive&returnPath=%2Frecommend-allocations%3FallowPartialAllocation%3Dtrue%26js%3Dtrue%26history%3DWyIva2V5LXdvcmtlciIsIi9rZXktd29ya2VyL2FsbG9jYXRlIiwiL2tleS13b3JrZXIvYWxsb2NhdGU%252FcXVlcnk9JmNlbGxMb2NhdGlvblByZWZpeD0xJmV4Y2x1ZGVBY3RpdmVBbGxvY2F0aW9ucz10cnVlIiwiL2tleS13b3JrZXIvcmVjb21tZW5kLWFsbG9jYXRpb25zIl0%253D',
      )
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

  const navigateToTestPage = (allowPartialAllocation: boolean = true, jsParam: boolean = true) => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(
      `/key-worker/recommend-allocations?allowPartialAllocation=${allowPartialAllocation}&js=${jsParam}&history=${encodeURIComponent(historyToBase64(['/key-worker', '/key-worker/allocate', '/key-worker/allocate?query=&cellLocationPrefix=1&excludeActiveAllocations=true', '/key-worker/recommend-allocations']))}`,
      { failOnStatusCode: false },
    )
  }
})
