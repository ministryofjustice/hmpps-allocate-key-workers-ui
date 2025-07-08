import { v4 as uuidV4 } from 'uuid'
import { PartialJourneyData } from '../../../../../../integration_tests/support/commands'
import AuthorisedRoles from '../../../../../authentication/authorisedRoles'

context('/manage-roles/remove/confirmation', () => {
  const journeyId = uuidV4()
  const PAGE_URL = `/key-worker/${journeyId}/manage-roles/remove/confirmation`

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
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

  it('should render confirmation page', () => {
    navigateToTestPage()
    cy.url().should('match', /\/confirmation$/)

    cy.title().should('equal', 'Confirmation - Key workers - DPS')
    cy.findByText('Key worker role removed').should('be.visible')
    cy.findByText('You have successfully removed the key worker role from Doe, Joe').should('be.visible')

    cy.findByRole('link', { name: /Return to key workers homepage/ })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/key-worker$/)
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(`/key-worker/${journeyId}/manage-roles/remove`, {
      failOnStatusCode: false,
    })

    cy.injectJourneyDataAndReload<PartialJourneyData>(journeyId, {
      removeStaffRole: {
        staff: {
          staffId: 1001,
          username: 'STAFFNAME',
          firstName: 'Joe',
          lastName: 'Doe',
          allocated: 12,
          staffRole: {
            position: { code: 'PRO', description: 'Prison officer' },
            scheduleType: { code: 'FT', description: 'Full-time' },
            hoursPerWeek: 35,
            fromDate: '2010-01-12',
          },
        },
      },
    })

    cy.visit(PAGE_URL)
  }
})
