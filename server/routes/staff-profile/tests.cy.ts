import { defaultKeyworkerDetails } from '../../../integration_tests/mockApis/keyworkerApi'
import AuthorisedRoles from '../../authentication/authorisedRoles'
import { createMock } from '../../testutils/mockObjects'

context('Profile Info', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn', {
      roles: [AuthorisedRoles.OMIC_ADMIN, AuthorisedRoles.KEYWORKER_MONITOR, AuthorisedRoles.KW_MIGRATION],
    })
    cy.task('stubEnabledPrison')
    cy.task('stubSearchAllocatableStaffStatusActive')
    cy.task('stubPutAllocationSuccess')
    cy.task('stubPutDeallocationSuccess')
    cy.task('stubKeyworkerDetails')
  })

  it('should show profile info', () => {
    navigateToTestPage()

    validatePageContents()
  })

  it('shows empty text when staff member has no allocations', () => {
    cy.task('stubKeyworkerDetails', createMock(defaultKeyworkerDetails, { allocations: [] }))
    navigateToTestPage()

    cy.findByText('There are no allocations for this key worker.').should('exist')
  })

  it('should show profile info (VIEW permission only)', () => {
    cy.task('stubSignIn', {
      user_id: '488095',
      roles: [AuthorisedRoles.KEYWORKER_MONITOR],
      hasAllocationJobResponsibilities: false,
    })

    navigateToTestPage()

    validatePageContents(true)
  })

  it('should show profile info (read self profile only)', () => {
    cy.task('stubSignIn', {
      user_id: '488095',
      roles: [],
      hasAllocationJobResponsibilities: true,
    })

    navigateToTestPage()

    validatePageContents(true)
  })

  it('should deny access to profile of other users (read self profile only)', () => {
    cy.task('stubSignIn', {
      user_id: 'OTHER_USER',
      roles: [],
      hasAllocationJobResponsibilities: true,
    })

    navigateToTestPage()

    cy.title().should('equal', 'Not authorised - Key workers - DPS')
    cy.findByText('You do not have permission to access this page').should('be.visible')
  })

  it('should show error when no allocations or deallocations are made', () => {
    navigateToTestPage()

    cy.findByRole('button', { name: /Save changes/i }).click()

    cy.findByText('There is a problem').should('be.visible')
    cy.findByRole('link', { name: /Select key workers from the dropdown lists/ })
      .should('be.visible')
      .should('have.attr', 'href', '#selectStaffMember')
  })

  it('should show error on de/allocation failure', () => {
    cy.task('stubPutAllocationFail500')
    navigateToTestPage()

    cy.visit('/key-worker/staff-profile/488095', { failOnStatusCode: false })

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

    cy.findByText('Sorry, there is a problem with the service').should('exist')
  })

  it('should show success message on deallocation', () => {
    cy.task('stubPutAllocationSuccess')
    cy.task('stubPutDeallocationSuccess')
    navigateToTestPage()

    cy.visit('/key-worker/staff-profile/488095', { failOnStatusCode: false })

    cy.get('.govuk-table__row').should('have.length', 3)
    cy.get('.govuk-table__row').eq(2).children().eq(0).should('contain.text', 'John, Doe')

    cy.get('#selectStaffMember').should('contain', 'Select key worker')
    cy.get('#selectStaffMember').should('contain', 'Deallocate')
    cy.get('#selectStaffMember').should('not.contain', 'Key-Worker, Available-Active (allocations: 32)')
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

    cy.visit('/key-worker/staff-profile/488095', { failOnStatusCode: false })

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
    cy.visit('/key-worker/staff-profile/488095', { failOnStatusCode: false })
  }

  const validatePageContents = (readonly = false) => {
    cy.title().should('equal', 'Key worker profile - Key workers - DPS')
    cy.findByRole('heading', { name: /^AVAILABLE-ACTIVE KEY-WORKER$/i }).should('be.visible')

    cy.findByRole('link', { name: 'Manage key workers' })
      .should('be.visible')
      .and('have.attr', 'href', '/key-worker/manage')

    cy.get('.status-tag').eq(0).should('have.text', 'Active')

    if (readonly) {
      cy.get('a[href*="/start-update-staff/488095?proceedTo=update-capacity-status"]').should('not.exist')
    } else {
      cy.get('a[href*="/start-update-staff/488095?proceedTo=update-capacity-status"]')
        .should('be.visible')
        .should('contain.text', 'Update capacity, status or working pattern')
    }

    cy.contains('Select key workers from the dropdown lists to reallocate or deallocate prisoners.').should(
      readonly ? 'not.exist' : 'exist',
    )
    cy.contains('Key workers will only be allocated when you save your changes.').should(
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
    cy.get('.govuk-grid-column-one-quarter').eq(4).children().eq(0).should('have.text', 'Projected sessions')
    cy.get('.govuk-grid-column-one-quarter').eq(4).children().eq(1).should('have.text', '1')
    cy.get('.govuk-grid-column-one-quarter').eq(4).children().eq(2).should('have.text', '-2 decrease')

    cy.get('.govuk-grid-column-one-quarter').eq(5).children().eq(0).should('have.text', 'Recorded case note sessions')
    cy.get('.govuk-grid-column-one-quarter').eq(5).children().eq(1).should('have.text', '3')
    cy.get('.govuk-grid-column-one-quarter').eq(5).children().eq(2).should('have.text', '+3 increase')

    cy.get('.govuk-grid-column-one-quarter').eq(6).children().eq(0).should('have.text', 'Session compliance')
    cy.get('.govuk-grid-column-one-quarter').eq(6).children().eq(1).should('have.text', '0 %')
    cy.get('.govuk-grid-column-one-quarter').eq(6).children().eq(2).should('have.text', 'No change')

    cy.get('.govuk-grid-column-one-quarter').eq(7).children().eq(0).should('have.text', 'Recorded case note entries')
    cy.get('.govuk-grid-column-one-quarter').eq(7).children().eq(1).should('have.text', '5')
    cy.get('.govuk-grid-column-one-quarter').eq(7).children().eq(2).should('have.text', '+5 increase')

    // Allocations panel
    cy.get('.govuk-table__row').eq(2).children().eq(0).should('contain.text', 'John, Doe')
    cy.get('.govuk-table__row').eq(2).children().eq(1).should('contain.text', '1-1-035')
    cy.get('.govuk-table__row').eq(2).children().eq(3).should('contain.text', '23/1/2025')
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
      cy.get('.govuk-button').should('not.exist')
    } else {
      cy.get('[data-sort-value="John, Doe"] > .govuk-link--no-visited-state').should(
        'have.attr',
        'href',
        'http://localhost:3001/prisoner/A4288DZ',
      )

      cy.get('[data-sort-value="John, Doe"] > .govuk-link--no-visited-state').should('have.attr', 'target', '_blank')
      cy.get('.govuk-button').should('contain.text', 'Save changes')
    }
  }
})
