import { v4 as uuidV4 } from 'uuid'
import { createMock } from '../../../testutils/mockObjects'
import { defaultKeyworkerDetails } from '../../../../integration_tests/mockApis/keyworkerApi'
import { verifyRoleBasedAccess } from '../../../../integration_tests/support/roleBasedAccess'
import { UserPermissionLevel } from '../../../interfaces/hmppsUser'

context('/update-capacity-status-and-working-pattern/** journey', () => {
  let journeyId = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task(
      'stubKeyworkerDetailsWithoutStats',
      createMock(defaultKeyworkerDetails, { status: { code: 'UNAVAILABLE', description: 'Unavailable' } }),
    )
    cy.task('stubKeyworkerStatuses')
    cy.task('stubUpsertStaffDetails')
  })

  describe('Role based access', () => {
    verifyRoleBasedAccess(
      `/key-worker/${journeyId}/start-update-staff/488095?proceedTo=update-capacity-status-and-working-pattern`,
      UserPermissionLevel.ALLOCATE,
    )
  })

  it('should update active status', () => {
    beginJourney()

    cy.findByRole('link', { name: 'Update status' }).click()

    cy.findByRole('radio', { name: 'Active' }).click()
    cy.findByRole('button', { name: 'Continue' }).click()

    cy.findByRole('button', { name: 'Confirm and submit' }).click()

    cy.get('.govuk-notification-banner__heading')
      .should('be.visible')
      .and('contain.text', 'You have updated this key worker’s status to Active.')

    cy.verifyLastAPICall(
      { method: 'PUT', urlPath: '/keyworker-api/prisons/LEI/staff/488095' },
      {
        capacity: 6,
        status: 'ACTIVE',
        staffRole: {
          position: 'PRO',
          scheduleType: 'FT',
          hoursPerWeek: 35,
          fromDate: '2024-12-18',
        },
        deactivateActiveAllocations: false,
      },
    )
  })

  it('should update inactive status and capacity', () => {
    beginJourney()

    cy.findByRole('link', { name: 'Update status' }).click()

    cy.findByRole('radio', { name: 'Inactive' }).click()
    cy.findByRole('button', { name: 'Continue' }).click()

    cy.findByRole('button', { name: 'Yes, save this change' }).click()

    cy.get('.govuk-notification-banner__heading')
      .should('be.visible')
      .and('contain.text', 'You have updated this key worker’s status to Inactive.')

    cy.verifyLastAPICall(
      { method: 'PUT', urlPath: '/keyworker-api/prisons/LEI/staff/488095' },
      {
        capacity: 6,
        status: 'INACTIVE',
        staffRole: {
          position: 'PRO',
          scheduleType: 'FT',
          hoursPerWeek: 35,
          fromDate: '2024-12-18',
        },
        deactivateActiveAllocations: true,
      },
    )
  })

  it('should update unavailable (non annual leave) status and capacity', () => {
    beginJourney()

    cy.findByRole('link', { name: 'Update status' }).click()

    cy.findByRole('radio', { name: 'Unavailable - no prisoner contact' }).click()
    cy.findByRole('button', { name: 'Continue' }).click()

    cy.findByRole('radio', { name: 'Deallocate their current prisoners' }).click()
    cy.findByRole('button', { name: 'Continue' }).click()

    // Can change answers
    cy.findByRole('link', { name: /Change the new status/i }).click()
    cy.findByRole('radio', { name: 'Unavailable - long term absence' }).click()
    cy.findByRole('button', { name: 'Continue' }).click()

    cy.findByRole('link', { name: /Change whether to deallocate current prisoners/i }).click()
    cy.findByRole('radio', { name: 'Do not deallocate their current prisoners' }).click()
    cy.findByRole('button', { name: 'Continue' }).click()

    // Confirm and submit
    cy.findByRole('button', { name: 'Confirm and submit' }).click()

    cy.get('.govuk-notification-banner__heading')
      .should('be.visible')
      .and('contain.text', 'You have updated this key worker’s status to Unavailable - long term absence.')

    cy.verifyLastAPICall(
      { method: 'PUT', urlPath: '/keyworker-api/prisons/LEI/staff/488095' },
      {
        capacity: 6,
        status: 'UNAVAILABLE_LONG_TERM_ABSENCE',
        staffRole: {
          position: 'PRO',
          scheduleType: 'FT',
          hoursPerWeek: 35,
          fromDate: '2024-12-18',
        },
        deactivateActiveAllocations: false,
      },
    )
  })

  it('should update unavailable (annual leave) status and capacity', () => {
    beginJourney()

    cy.findByRole('link', { name: 'Update status' }).click()

    cy.findByRole('radio', { name: 'Unavailable - annual leave' }).click()
    cy.findByRole('button', { name: 'Continue' }).click()

    cy.findByRole('radio', { name: 'Deallocate their current prisoners' }).click()
    cy.findByRole('button', { name: 'Continue' }).click()

    cy.findByRole('textbox', { name: 'Day' }).clear().type('1')
    cy.findByRole('textbox', { name: 'Month' }).clear().type('1')
    cy.findByRole('textbox', { name: 'Year' }).clear().type('2070')
    cy.findByRole('button', { name: 'Continue' }).click()

    // Can change answers
    cy.findByRole('link', { name: /Change the return date/i }).click()
    cy.findByRole('textbox', { name: 'Day' }).clear().type('9')
    cy.findByRole('textbox', { name: 'Month' }).clear().type('9')
    cy.findByRole('textbox', { name: 'Year' }).clear().type('2071')
    cy.findByRole('button', { name: 'Continue' }).click()

    // Confirm and submit
    cy.findByRole('button', { name: 'Confirm and submit' }).click()

    cy.get('.govuk-notification-banner__heading')
      .should('be.visible')
      .and('contain.text', 'You have updated this key worker’s status to Unavailable - annual leave.')

    cy.verifyLastAPICall(
      { method: 'PUT', urlPath: '/keyworker-api/prisons/LEI/staff/488095' },
      {
        capacity: 6,
        status: 'UNAVAILABLE_ANNUAL_LEAVE',
        staffRole: {
          position: 'PRO',
          scheduleType: 'FT',
          hoursPerWeek: 35,
          fromDate: '2024-12-18',
        },
        deactivateActiveAllocations: true,
        reactivateOn: '2071-09-09T00:00:00.000Z',
      },
    )
  })

  it('should construct backUrl correctly', () => {
    cy.task('stubSearchAllocatableStaffStatusActive')
    cy.task('stubKeyworkerDetails')
    cy.task('stubSearchCaseNotes')
    cy.signIn({ failOnStatusCode: false })
    cy.visitWithHistory(`/key-worker/staff-profile/488095`, [
      '/key-worker',
      '/key-worker/manage',
      '/key-worker/staff-profile/488095',
    ])
    cy.get('a[href*="/start-update-staff/488095?proceedTo=update-capacity-status-and-working-pattern"]').click()

    cy.findByRole('link', { name: 'Back to key worker profile' }).click()
    cy.url().should('match', /\/key-worker\/staff-profile\/488095\?/)

    cy.findByRole('link', { name: 'View recent case notes' }).click()
    cy.url().should('match', /\/key-worker\/staff-profile\/488095\/case-notes/)

    cy.get('a[href*="/start-update-staff/488095?proceedTo=update-capacity-status-and-working-pattern"]').click()

    cy.findByRole('link', { name: 'Back to key worker profile' }).click()
    cy.url().should('match', /\/key-worker\/staff-profile\/488095\/case-notes/)
  })

  const beginJourney = () => {
    journeyId = uuidV4()
    cy.signIn({ failOnStatusCode: false })
    cy.visit(
      `/key-worker/${journeyId}/start-update-staff/488095?proceedTo=update-capacity-status-and-working-pattern`,
      {
        failOnStatusCode: false,
      },
    )
  }
})
