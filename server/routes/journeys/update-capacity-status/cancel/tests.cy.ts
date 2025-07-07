import { v4 as uuidV4 } from 'uuid'
import { createMock } from '../../../../testutils/mockObjects'
import { defaultKeyworkerDetails } from '../../../../../integration_tests/mockApis/keyworkerApi'
import AuthorisedRoles from '../../../../authentication/authorisedRoles'

context('/update-capacity-status/cancel', () => {
  const journeyId = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task(
      'stubKeyworkerDetails',
      createMock(defaultKeyworkerDetails, { status: { code: 'INACTIVE', description: 'Inactive' } }),
    )
    cy.task('stubKeyworkerStatuses')
  })

  describe('Role based access', () => {
    it('should deny access to a user with only policy job access', () => {
      cy.task('stubSignIn', {
        roles: [],
        hasAllocationJobResponsibilities: true,
      })

      navigateToTestPage()

      cy.url().should('to.match', /\/key-worker\/not-authorised/)
    })

    it('should deny access to a user with view only access', () => {
      cy.task('stubSignIn', {
        roles: [AuthorisedRoles.KEYWORKER_MONITOR, AuthorisedRoles.PERSONAL_OFFICER_VIEW],
      })

      navigateToTestPage()

      cy.url().should('to.match', /\/key-worker\/not-authorised/)
    })
  })

  it('should cancel to /update-capacity-status page', () => {
    cy.visit(`/key-worker/${journeyId}/update-capacity-status/cancel`)

    cy.url().should('match', /\/update-capacity-status$/)
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(`/key-worker/${journeyId}/start-update-staff/488095?proceedTo=update-capacity-status`, {
      failOnStatusCode: false,
    })
  }
})
