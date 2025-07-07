import { v4 as uuidV4 } from 'uuid'
import { PartialJourneyData } from '../../../../../../integration_tests/support/commands'
import AuthorisedRoles from '../../../../../authentication/authorisedRoles'

context('/manage-roles/assign/check-answers', () => {
  const journeyId = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task('stubUpsertStaffDetails')
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

  it('should try all cases', () => {
    navigateToTestPage()
    cy.url().should('match', /\/check-answers$/)

    verifyPageContent()

    cy.contains('dt', 'Name').next().should('include.text', 'Doe, Joe')
    cy.contains('dt', 'Role').next().should('include.text', 'Prison officer')
    cy.contains('dt', 'Working pattern').next().should('include.text', 'Full-time')
    cy.contains('dt', 'Maximum capacity').next().should('include.text', '9')

    cy.findByRole('link', { name: /Change the staff member$/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('to.match', /..\/assign$/)

    cy.findByRole('link', { name: /Change whether the staff member is a prison officer/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('to.match', /role$/)

    cy.findByRole('link', { name: /Change the staff member’s working pattern/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('to.match', /working-pattern$/)

    cy.findByRole('link', { name: /Change the staff member’s maximum capacity/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('to.match', /capacity$/)

    proceedToNextPage()

    cy.verifyLastAPICall(
      { method: 'PUT', urlPath: '/keyworker-api/prisons/LEI/staff/1001' },
      {
        staffRole: {
          position: 'PRO',
          scheduleType: 'FT',
          hoursPerWeek: 35,
          capacity: 9,
        },
      },
    )
  })

  const verifyPageContent = () => {
    cy.title().should('equal', 'Check your answers - Key workers - DPS')
    cy.findByRole('heading', { name: 'Check your answers' }).should('be.visible')
    cy.findByRole('button', { name: 'Confirm and submit' }).should('be.visible')
  }

  const proceedToNextPage = () => {
    cy.findByRole('button', { name: 'Confirm and submit' }).click()
    cy.url().should('match', /\/confirmation$/)
  }

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
        isPrisonOfficer: true,
        scheduleType: { code: 'FT', description: 'Full-time' },
        hoursPerWeek: 35,
        capacity: 9,
      },
    })

    cy.visit(`/key-worker/${journeyId}/manage-roles/assign/check-answers`)
  }
})
