import { v4 as uuidV4 } from 'uuid'
import { createMock } from '../../../testutils/mockObjects'
import { defaultKeyworkerDetails } from '../../../../integration_tests/mockApis/keyworkerApi'
import { verifyRoleBasedAccess } from '../../../../integration_tests/support/roleBasedAccess'
import { UserPermissionLevel } from '../../../interfaces/hmppsUser'

context('Update capacity, status and working pattern', () => {
  const journeyId = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task(
      'stubKeyworkerDetailsWithoutStats',
      createMock(defaultKeyworkerDetails, { status: { code: 'INACTIVE', description: 'Inactive' } }),
    )
  })

  describe('Role based access', () => {
    verifyRoleBasedAccess(
      `/key-worker/${journeyId}/start-update-staff/488095?proceedTo=update-capacity-status-and-working-pattern`,
      UserPermissionLevel.ALLOCATE,
    )
  })

  it('should show staff details and change links', () => {
    navigateToTestPage()
    cy.url().should('match', /\/update-capacity-status-and-working-pattern\?/)

    cy.findByRole('heading', {
      name: 'Available-Active Key-Worker – update capacity, status or working pattern',
    }).should('be.visible')

    cy.findByRole('link', { name: 'Back to key worker profile' })
      .should('be.visible')
      .shouldContainHistoryParam([
        `/key-worker/${journeyId}/start-update-staff/488095?proceedTo=update-capacity-status-and-working-pattern`,
        `/key-worker/${journeyId}/update-capacity-status-and-working-pattern`,
      ])

    cy.contains('dt', 'Status').next().should('include.text', 'Inactive')
    cy.contains('dt', 'Maximum capacity').next().should('include.text', '6')
    cy.contains('dt', 'Working pattern').next().should('include.text', 'Full Time')

    cy.findByRole('link', { name: /Update status/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('to.match', /update-status/)
    cy.findByRole('link', { name: /Update maximum capacity/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('to.match', /update-capacity/)
    cy.findByRole('link', { name: /Update working pattern/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('to.match', /update-working-pattern/)
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(
      `/key-worker/${journeyId}/start-update-staff/488095?proceedTo=update-capacity-status-and-working-pattern`,
      {
        failOnStatusCode: false,
      },
    )
  }
})
