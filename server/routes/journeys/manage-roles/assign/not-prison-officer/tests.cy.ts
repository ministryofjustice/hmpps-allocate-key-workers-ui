import { v4 as uuidV4 } from 'uuid'
import { PartialJourneyData } from '../../../../../../integration_tests/support/commands'
import AuthorisedRoles from '../../../../../authentication/authorisedRoles'

context('/manage-roles/assign/not-prison-officer', () => {
  const journeyId = uuidV4()
  const PAGE_URL = `/key-worker/${journeyId}/manage-roles/assign/not-prison-officer`

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

  it('should render error page', () => {
    navigateToTestPage()
    cy.url().should('match', /\/assign\/not-prison-officer$/)

    cy.title().should('equal', 'Not a prison officer - Key workers - DPS')

    cy.findByRole('heading', {
      name: 'You cannot make this person a key worker',
    }).should('be.visible')

    cy.findByRole('link', { name: 'Return to key workers homepage' })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /key-worker$/)
    cy.findByRole('link', { name: 'Back' }).should('be.visible').and('have.attr', 'href').and('match', /role$/)
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(`/key-worker/${journeyId}/manage-roles/assign`, {
      failOnStatusCode: false,
    })

    cy.injectJourneyDataAndReload<PartialJourneyData>(journeyId, {
      assignStaffRole: {
        staff: {
          staffId: 1001,
          username: 'STAFFNAME',
          firstName: 'Joe',
          lastName: 'Doe',
        },
        isPrisonOfficer: false,
      },
    })

    cy.visit(PAGE_URL)
  }
})
