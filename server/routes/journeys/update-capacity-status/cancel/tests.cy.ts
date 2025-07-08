import { v4 as uuidV4 } from 'uuid'
import { createMock } from '../../../../testutils/mockObjects'
import { defaultKeyworkerDetails } from '../../../../../integration_tests/mockApis/keyworkerApi'
import AuthorisedRoles from '../../../../authentication/authorisedRoles'

context('/update-capacity-status/cancel', () => {
  const journeyId = uuidV4()
  const PAGE_URL = `/key-worker/${journeyId}/update-capacity-status/cancel`

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
      cy.verifyRoleBasedAccess({ userRoles: [], hasJobResponsibility: true, url: PAGE_URL })
    })

    it('should deny access to a user with view only access', () => {
      cy.verifyRoleBasedAccess({
        userRoles: [AuthorisedRoles.KEYWORKER_MONITOR, AuthorisedRoles.PERSONAL_OFFICER_VIEW],
        url: PAGE_URL,
      })
    })
  })

  it('should cancel to /update-capacity-status page', () => {
    cy.visit(PAGE_URL)

    cy.url().should('match', /\/update-capacity-status$/)
  })
})
