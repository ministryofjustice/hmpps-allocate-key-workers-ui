import { defaultPrisonerAllocation } from '../../../integration_tests/mockApis/keyworkerApi'
import { verifyRoleBasedAccess } from '../../../integration_tests/support/roleBasedAccess'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'
import { createMock } from '../../testutils/mockObjects'

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

  describe('Role based access', () => {
    verifyRoleBasedAccess('/key-worker/prisoner-allocation-history/A9965EA', UserPermissionLevel.SELF_PROFILE_ONLY)
  })

  it('happy path', () => {
    navigateToTestPage()

    cy.verifyLastAPICall(
      {
        method: 'GET',
        headers: { Policy: { matches: 'key-worker' } },
        url: '/keyworker-api/prisoners/A9965EA/allocations',
      },
      '',
    )

    cy.title().should('equal', 'Prisoner key worker allocation history - Key workers - DPS')

    cy.get('.govuk-breadcrumbs__list-item').eq(0).should('include.text', 'Digital Prison Services')
    cy.get('.govuk-breadcrumbs__list-item').eq(1).should('include.text', 'Key worker')
    cy.get('.govuk-breadcrumbs__list-item').eq(2).should('include.text', 'Manage key workers')
    cy.get('.govuk-breadcrumbs__list-item').eq(3).should('include.text', 'Key worker profile')

    cy.get('h1').should('have.text', 'Cat, Tabby (A9965EA)')

    cy.get('.govuk-heading-l').eq(0).should('have.text', 'Prisoner key worker allocation history')
    cy.findByText('Current and previous allocations: 2').should('be.visible')

    // Current key worker card
    cy.get('.govuk-summary-card')
      .eq(0)
      .within(() => {
        cy.get('.govuk-summary-card__title').eq(0).should('include.text', 'Current key worker: Sample Keyworker')

        cy.contains('dt', 'Establishment').next().should('include.text', 'Moorland (HMP & YOI)')
        cy.contains('dt', 'Allocated on').next().should('include.text', '17/04/2025 14:41')
        cy.contains('dt', 'Allocated by').next().should('include.text', 'Test Keyworker')
        cy.contains('dt', 'Deallocated on').next().should('include.text', '-')
        cy.contains('dt', 'Deallocated by').next().should('include.text', '-')
        cy.contains('dt', 'Deallocation reason').next().should('include.text', '-')
      })

    // Previous key worker card
    cy.get('.govuk-summary-card')
      .eq(1)
      .within(() => {
        cy.get('.govuk-summary-card__title').eq(0).should('include.text', 'Previous key worker: Smith Last-Name')

        cy.contains('dt', 'Establishment').next().should('include.text', 'Moorland (HMP & YOI)')
        cy.contains('dt', 'Allocated on').next().should('include.text', '18/12/2024 10:56')
        cy.contains('dt', 'Allocated by').next().should('include.text', 'Foo Baz')
        cy.contains('dt', 'Deallocated on').next().should('include.text', '12/02/2025 15:57')
        cy.contains('dt', 'Deallocated by').next().should('include.text', 'Fake Doe')
        cy.contains('dt', 'Deallocation reason').next().should('include.text', 'Manual')
      })

    cy.verifyAuditEvents([
      {
        who: 'USER1',
        subjectType: 'NOT_APPLICABLE',
        details: '{"pageUrl":"/key-worker","pageName":"HOMEPAGE","activeCaseLoadId":"LEI","policy":"KEY_WORKER"}',
        what: 'PAGE_VIEW_ACCESS_ATTEMPT',
        service: 'DPS023',
      },
      {
        who: 'USER1',
        subjectType: 'PRISONER_ID',
        details:
          '{"pageUrl":"/key-worker/prisoner-allocation-history/A9965EA","pageName":"PRISONER_ALLOCATION_HISTORY","activeCaseLoadId":"LEI","policy":"KEY_WORKER"}',
        subjectId: 'A9965EA',
        what: 'PAGE_VIEW',
        service: 'DPS023',
      },
      {
        who: 'USER1',
        subjectType: 'PRISONER_ID',
        details:
          '{"pageUrl":"/key-worker/prisoner-allocation-history/A9965EA","pageName":"PRISONER_ALLOCATION_HISTORY","activeCaseLoadId":"LEI","policy":"KEY_WORKER"}',
        subjectId: 'A9965EA',
        what: 'PAGE_VIEW_ACCESS_ATTEMPT',
        service: 'DPS023',
      },
    ])
  })

  it('correctly maps deallocation reasons', () => {
    cy.task('stubPrisonerAllocations', [
      createMock(defaultPrisonerAllocation, { deallocated: { reason: { code: 'OVERRIDE', description: 'Override' } } }),
      createMock(defaultPrisonerAllocation, { deallocated: { reason: { code: 'MISSING', description: 'Missing' } } }),
      createMock(defaultPrisonerAllocation, {
        deallocated: { reason: { code: 'DUPLICATE', description: 'Duplicate' } },
      }),
      createMock(defaultPrisonerAllocation, { deallocated: { reason: { code: 'MERGED', description: 'Merged' } } }),
      createMock(defaultPrisonerAllocation, { deallocated: { reason: { code: 'MANUAL', description: 'Manual' } } }),
      createMock(defaultPrisonerAllocation, { deallocated: { reason: { code: 'RELEASED', description: 'Released' } } }),
      createMock(defaultPrisonerAllocation, {
        deallocated: { reason: { code: 'KEYWORKER_STATUS_CHANGE', description: 'Keyworker Status Changed' } },
      }),
      createMock(defaultPrisonerAllocation, { deallocated: { reason: { code: 'TRANSFER', description: 'Transfer' } } }),
      createMock(defaultPrisonerAllocation, {
        deallocated: { reason: { code: 'CHANGE_IN_COMPLEXITY_OF_NEED', description: 'Change in complexity of need' } },
      }),
    ])

    navigateToTestPage()

    cy.get('.govuk-summary-card')
      .eq(0)
      .within(() => {
        cy.contains('dt', 'Deallocation reason').next().should('include.text', 'Manual')
      })

    cy.get('.govuk-summary-card')
      .eq(1)
      .within(() => {
        cy.contains('dt', 'Deallocation reason').next().should('include.text', 'Automatic')
      })

    cy.get('.govuk-summary-card')
      .eq(2)
      .within(() => {
        cy.contains('dt', 'Deallocation reason').next().should('include.text', 'Automatic')
      })

    cy.get('.govuk-summary-card')
      .eq(3)
      .within(() => {
        cy.contains('dt', 'Deallocation reason').next().should('include.text', 'Automatic')
      })

    cy.get('.govuk-summary-card')
      .eq(4)
      .within(() => {
        cy.contains('dt', 'Deallocation reason').next().should('include.text', 'Manual')
      })

    cy.get('.govuk-summary-card')
      .eq(5)
      .within(() => {
        cy.contains('dt', 'Deallocation reason').next().should('include.text', 'Released')
      })

    cy.get('.govuk-summary-card')
      .eq(6)
      .within(() => {
        cy.contains('dt', 'Deallocation reason').next().should('include.text', 'Keyworker Status Changed')
      })

    cy.get('.govuk-summary-card')
      .eq(7)
      .within(() => {
        cy.contains('dt', 'Deallocation reason').next().should('include.text', 'Transfer')
      })

    cy.get('.govuk-summary-card')
      .eq(8)
      .within(() => {
        cy.contains('dt', 'Deallocation reason').next().should('include.text', 'Change in complexity of need')
      })
  })

  describe('Personal officer', () => {
    it('happy path', () => {
      cy.signIn({ failOnStatusCode: false })
      cy.visit(
        `/personal-officer/prisoner-allocation-history/A9965EA?history=WyIvcGVyc29uYWwtb2ZmaWNlciIsIi9wZXJzb25hbC1vZmZpY2VyL21hbmFnZT9xdWVyeT1Eb20mc3RhdHVzPUFDVElWRSIsIi9wZXJzb25hbC1vZmZpY2VyL3N0YWZmLXByb2ZpbGUvNDg1NTcyIl0=`,
        { failOnStatusCode: false },
      )

      cy.verifyLastAPICall(
        {
          method: 'GET',
          headers: { Policy: { matches: 'personal-officer' } },
          url: '/keyworker-api/prisoners/A9965EA/allocations',
        },
        '',
      )

      cy.title().should('equal', 'Prisoner personal officer allocation history - Personal officers - DPS')

      cy.get('.govuk-breadcrumbs__list-item').eq(0).should('include.text', 'Digital Prison Services')
      cy.get('.govuk-breadcrumbs__list-item').eq(1).should('include.text', 'Personal officer')
      cy.get('.govuk-breadcrumbs__list-item').eq(2).should('include.text', 'Manage personal officers')
      cy.get('.govuk-breadcrumbs__list-item').eq(3).should('include.text', 'Key worker profile')

      cy.get('h1').should('have.text', 'Cat, Tabby (A9965EA)')

      cy.get('.govuk-heading-l').should('have.length', 0)
      cy.findByText('Current and previous allocations: 2').should('be.visible')

      cy.get('.moj-sub-navigation__item').should('have.length', 2)
      cy.get('.moj-sub-navigation__item').eq(0).should('include.text', 'Personal officer allocation history')
      cy.get('.moj-sub-navigation__item').eq(1).should('include.text', 'Key worker allocation history')

      cy.get('.govuk-summary-card__title').eq(0).should('include.text', 'Current personal officer: Sample Keyworker')
      cy.get('.govuk-summary-card__title').eq(1).should('include.text', 'Previous personal officer: Smith Last-Name')

      cy.get('.moj-sub-navigation__item').eq(1).click()
      cy.url().should('match', /\/personal-officer\/prisoner-allocation-history\/A9965EA\/key-worker/)

      cy.verifyLastAPICall(
        {
          method: 'GET',
          headers: { Policy: { matches: 'key-worker' } },
          url: '/keyworker-api/prisoners/A9965EA/allocations',
        },
        '',
      )

      cy.get('.govuk-summary-card__title').eq(0).should('include.text', 'Current key worker: Sample Keyworker')
      cy.get('.govuk-summary-card__title').eq(1).should('include.text', 'Previous key worker: Smith Last-Name')
    })
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(
      `/key-worker/prisoner-allocation-history/A9965EA?history=WyIva2V5LXdvcmtlciIsIi9rZXktd29ya2VyL21hbmFnZT9xdWVyeT1Eb20mc3RhdHVzPUFDVElWRSIsIi9rZXktd29ya2VyL3N0YWZmLXByb2ZpbGUvNDg1NTcyIl0=`,
      { failOnStatusCode: false },
    )
  }
})
