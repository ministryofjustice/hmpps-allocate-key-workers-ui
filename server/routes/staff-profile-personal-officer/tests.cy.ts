import { defaultKeyworkerDetails } from '../../../integration_tests/mockApis/keyworkerApi'
import AuthorisedRoles from '../../authentication/authorisedRoles'
import { createMock } from '../../testutils/mockObjects'

context('Personal Officer Profile Info', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn', {
      user_id: '488095',
      roles: [AuthorisedRoles.KW_MIGRATION],
      hasAllocationJobResponsibilities: false,
    })
    cy.task('stubEnabledPrison')
    cy.task('stubSearchAllocatableStaffStatusActive')
    cy.task('stubPutAllocationSuccess')
    cy.task('stubPutDeallocationSuccess')
    cy.task('stubKeyworkerDetails')
  })

  describe('Role based access', () => {
    it('should show profile info (read self profile only)', () => {
      cy.task('stubSignIn', {
        user_id: '488095',
        roles: [],
        hasAllocationJobResponsibilities: true,
      })

      navigateToTestPage()

      validatePageContents(true)
    })

    it('should deny access to a view only user POSTing to the page', () => {
      cy.task('stubSignIn', {
        roles: [AuthorisedRoles.KEYWORKER_MONITOR, AuthorisedRoles.PERSONAL_OFFICER_VIEW],
      })

      navigateToTestPage()

      cy.verifyPostRedirectsToNotAuthorised({ body: { selectStaffMember: 'G1618UI:allocate:486018' } })
    })
  })

  it('should accept date range input', () => {
    navigateToTestPage()

    cy.findByRole('button', { name: 'Show date filter' }).click()

    cy.findAllByRole('textbox', { name: 'From' }).first().type('1/1/2000')
    cy.findAllByRole('textbox', { name: 'To' }).first().type('31/1/2000')

    cy.findAllByRole('textbox', { name: 'From' }).last().type('1/2/2000')
    cy.findAllByRole('textbox', { name: 'To' }).last().type('28/2/2000')

    cy.findByRole('button', { name: 'Apply filter' }).click()

    cy.findAllByText('Date range to view').should('be.visible')
    cy.findAllByText('1/1/2000 to 31/1/2000').should('be.visible')
    cy.findAllByText('Date range to compare against').should('be.visible')
    cy.findAllByText('1/2/2000 to 28/2/2000').should('be.visible')
  })

  it('should show profile info', () => {
    navigateToTestPage()

    validatePageContents()

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
        subjectType: 'NOT_APPLICABLE',
        details:
          '{"pageUrl":"/personal-officer/staff-profile/488095?js=true","activeCaseLoadId":"LEI","policy":"PERSONAL_OFFICER"}',
        what: 'PAGE_VIEW_ACCESS_ATTEMPT',
        service: 'DPS023',
      },
      {
        who: 'USER1',
        subjectType: 'SEARCH_TERM',
        details:
          '{"pageUrl":"/personal-officer/staff-profile/488095?js=true","pageName":"STAFF_ALLOCATIONS","staffId":"488095","query":"488095","activeCaseLoadId":"LEI","policy":"PERSONAL_OFFICER"}',
        subjectId: '488095',
        what: 'PAGE_VIEW',
        service: 'DPS023',
      },
      {
        who: 'USER1',
        subjectType: 'SEARCH_TERM',
        details:
          '{"pageUrl":"/personal-officer/staff-profile/488095?js=true","pageName":"STAFF_ALLOCATIONS","staffId":"488095","query":"488095","activeCaseLoadId":"LEI","policy":"PERSONAL_OFFICER"}',
        subjectId: '488095',
        what: 'PAGE_VIEW_ACCESS_ATTEMPT',
        service: 'DPS023',
      },
    ])
  })

  it('shows empty text when staff member has no allocations', () => {
    cy.task('stubKeyworkerDetails', createMock(defaultKeyworkerDetails, { allocations: [] }))
    navigateToTestPage()

    cy.findByText('There are no allocations for this personal officer.').should('exist')
  })

  it('should show profile info (VIEW permission only)', () => {
    cy.task('stubSignIn', {
      user_id: '488095',
      roles: [AuthorisedRoles.PERSONAL_OFFICER_VIEW],
      hasAllocationJobResponsibilities: false,
    })

    navigateToTestPage()

    validatePageContents(true)
  })

  it('should show error when no allocations or deallocations are made', () => {
    navigateToTestPage()

    cy.findByRole('button', { name: /Save changes/i }).click()

    cy.findByText('There is a problem').should('be.visible')
    cy.findByRole('link', { name: /Select personal officers from the dropdown lists/ })
      .should('be.visible')
      .should('have.attr', 'href')
      .should('match', /#selectStaffMember$/)
  })

  it('should show error on de/allocation failure', () => {
    cy.task('stubPutAllocationFail500')
    navigateToTestPage()

    cy.visit('/personal-officer/staff-profile/488095', { failOnStatusCode: false })

    cy.get('.govuk-table__row').should('have.length', 3)
    cy.get('.govuk-table__row').eq(2).children().eq(0).should('contain.text', 'John, Doe')

    cy.findAllByRole('combobox').eq(1).focus().select('Deallocate')

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

    cy.visit('/personal-officer/staff-profile/488095', { failOnStatusCode: false })

    cy.get('.govuk-table__row').should('have.length', 3)
    cy.get('.govuk-table__row').eq(2).children().eq(0).should('contain.text', 'John, Doe')

    cy.get('#selectStaffMember').should('contain', 'Select personal officer')
    cy.get('#selectStaffMember').should('contain', 'Deallocate')
    cy.get('#selectStaffMember').should('not.contain', 'Key-Worker, Available-Active (allocations: 32)')
    cy.findAllByRole('combobox').eq(1).focus().select('Deallocate')

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

    cy.visit('/personal-officer/staff-profile/488095', { failOnStatusCode: false })

    cy.get('.govuk-table__row').should('have.length', 3)
    cy.get('.govuk-table__row').eq(2).children().eq(0).should('contain.text', 'John, Doe')

    cy.get('select').eq(0).should('contain', 'Deallocate')
    cy.get('select').eq(0).should('not.contain', 'Key-Worker, Available-Active (allocations: 32)')
    cy.get('select').eq(0).should('contain', 'Key-Worker, Available-Active2 (allocations: 32)')

    cy.get('select').eq(1).focus()
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

  describe('JS Dropdown', () => {
    it('should not populate dropdowns when client side JS is disabled and the js query param is set', () => {
      navigateToTestPage(true, win => {
        // @ts-expect-error add property to client window
        win['jsDisabled'] = true // eslint-disable-line no-param-reassign
      })

      cy.get('.placeholder-select').eq(1).children().should('have.length', 1)
      cy.get('.placeholder-select').eq(1).focus()
      cy.get('.placeholder-select').eq(1).children().should('have.length', 1)
    })

    it('should populate dropdowns through nunjucks when client side JS is disabled', () => {
      navigateToTestPage(false, win => {
        // @ts-expect-error add property to client window
        win['jsDisabled'] = true // eslint-disable-line no-param-reassign
      })

      cy.get('.placeholder-select').eq(1).children().should('have.length', 4)
    })

    it('should populate dropdowns through client side JS when available', () => {
      navigateToTestPage(true, win => {
        // @ts-expect-error add property to client window
        win['jsDisabled'] = false // eslint-disable-line no-param-reassign
      })
      // Nunjucks prepopulates with one item (or two if on recommend allocations page) and then JS populates the rest on focus
      cy.get('.placeholder-select').eq(1).children().should('have.length', 1)
      cy.get('.placeholder-select').eq(1).focus()
      cy.get('.placeholder-select').eq(1).children().should('have.length', 3)
    })
  })

  const navigateToTestPage = (jsParam: boolean = true, onBeforeLoad?: (win: Window) => void) => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(
      `/personal-officer/staff-profile/488095?js=${jsParam}&history=WyIva2V5LXdvcmtlciIsIi9rZXktd29ya2VyL21hbmFnZSIsIi9rZXktd29ya2VyL3N0YWZmLXByb2ZpbGUvMzQzNTMiXQ%3D%3D`,
      {
        failOnStatusCode: false,
        ...(onBeforeLoad ? { onBeforeLoad } : {}),
      },
    )
  }

  const validatePageContents = (readonly = false) => {
    cy.title().should('equal', 'Personal officer profile - Personal officers - DPS')
    cy.findByRole('heading', { name: /^AVAILABLE-ACTIVE KEY-WORKER$/i }).should('be.visible')

    cy.get('.status-tag').eq(0).should('have.text', 'Active')

    if (readonly) {
      cy.get('a[href*="/start-update-staff/488095?proceedTo=update-capacity-status-and-working-pattern"]').should(
        'not.exist',
      )
    } else {
      cy.get('a[href*="/start-update-staff/488095?proceedTo=update-capacity-status-and-working-pattern"]')
        .should('be.visible')
        .should('contain.text', 'Update capacity, status or working pattern')
    }

    cy.contains('Select personal officers from the dropdown lists to reallocate or deallocate prisoners.').should(
      readonly ? 'not.exist' : 'exist',
    )
    cy.contains('Personal officers will only be allocated when you save your changes.').should(
      readonly ? 'not.exist' : 'exist',
    )

    // Details panel
    cy.get('.govuk-grid-column-one-quarter').eq(0).children().eq(0).should('have.text', 'Establishment')
    cy.get('.govuk-grid-column-one-quarter').eq(0).children().eq(1).should('have.text', 'Leeds (HMP)')
    cy.get('.govuk-grid-column-one-quarter').eq(1).children().eq(0).should('have.text', 'Working pattern')
    cy.get('.govuk-grid-column-one-quarter').eq(1).children().eq(1).should('have.text', 'Full Time')

    cy.get('.govuk-grid-column-one-quarter').eq(2).children().eq(0).should('have.text', 'Prisoners allocated')
    cy.get('.govuk-grid-column-one-quarter').eq(2).children().eq(1).should('have.text', '1')

    cy.get('.govuk-grid-column-one-quarter').eq(3).children().eq(0).should('have.text', 'Maximum capacity')
    cy.get('.govuk-grid-column-one-quarter').eq(3).children().eq(1).should('have.text', '6')

    // Stats panel
    cy.get('.govuk-grid-column-one-quarter').eq(4).children().eq(0).should('have.text', 'Recorded case note entries')
    cy.get('.govuk-grid-column-one-quarter').eq(4).children().eq(1).should('have.text', '5')
    cy.get('.govuk-grid-column-one-quarter').eq(4).children().eq(2).should('have.text', '+5 increase')

    // Allocations panel
    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'Bar, Foo')
    cy.get('.govuk-table__row').eq(1).children().eq(1).should('contain.text', '3-1-027')
    cy.get('.govuk-table__row').eq(1).children().eq(2).should('contain.text', 'None')
    cy.get('.govuk-table__row').eq(1).children().eq(3).should('contain.text', 'None')
    cy.get('.govuk-table__row').eq(1).children().eq(4).should('contain.text', '0')

    cy.get('.govuk-table__row').eq(2).children().eq(0).should('contain.text', 'John, Doe')
    cy.get('.govuk-table__row').eq(2).children().eq(1).should('contain.text', '1-1-035')
    cy.get('.govuk-table__row').eq(2).children().eq(2).should('contain.text', 'None')
    cy.get('.govuk-table__row').eq(2).children().eq(3).should('contain.text', '23/1/2025')
    cy.get('.govuk-table__row').eq(2).children().eq(4).should('contain.text', '1')
    cy.get('.govuk-table__row')
      .eq(2)
      .children()
      .eq(readonly ? 5 : 6)
      .should('contain.text', 'View allocation history')

    cy.get('.govuk-table__row')
      .eq(2)
      .children()
      .should('have.length', readonly ? 6 : 7)

    if (readonly) {
      cy.findByRole('button', { name: 'Save changes' }).should('not.exist')
    } else {
      cy.get('[data-sort-value="John, Doe"] > .govuk-link--no-visited-state').should(
        'have.attr',
        'href',
        'http://localhost:3001/prisoner/A4288DZ',
      )

      cy.get('[data-sort-value="John, Doe"] > .govuk-link--no-visited-state').should('have.attr', 'target', '_blank')
      cy.findByRole('button', { name: 'Save changes' }).should('be.visible')
    }
  }
})
