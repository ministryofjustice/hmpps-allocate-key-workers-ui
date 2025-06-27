import { v4 as uuidV4 } from 'uuid'
import { PartialJourneyData } from '../../../../../../integration_tests/support/commands'
import { todayString } from '../../../../../utils/datetimeUtils'

context('/manage-staff-roles/assign/check-answers', () => {
  const journeyId = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task('stubAssignRoleToStaff')
  })

  it('should try all cases', () => {
    navigateToTestPage()
    cy.url().should('match', /\/check-answers$/)

    verifyPageContent()

    cy.contains('dt', 'Name').next().should('include.text', 'Doe, Joe')
    cy.contains('dt', 'Role').next().should('include.text', 'Prison officer')
    cy.contains('dt', 'Working pattern').next().should('include.text', 'Full-time')

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

    proceedToNextPage()

    cy.verifyLastAPICall(
      { method: 'PUT', urlPath: '/keyworker-api/prisons/LEI/staff/1001/job-classifications' },
      {
        position: 'PRO',
        scheduleType: 'FT',
        hoursPerWeek: 35,
        fromDate: todayString(),
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
    cy.visit(`/key-worker/${journeyId}/manage-staff-roles/assign`, {
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
      },
    })

    cy.visit(`/key-worker/${journeyId}/manage-staff-roles/assign/check-answers`)
  }
})
