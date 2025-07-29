import { v4 as uuidV4 } from 'uuid'
import { PartialJourneyData } from '../../../../../../integration_tests/support/commands'
import { POLICIES } from '../../../../../utils/constants'

context('/manage-roles/assign/check-answers', () => {
  const journeyId = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task('stubUpsertStaffDetails')
  })

  Object.values(POLICIES).forEach(policy => {
    it(`should try all cases - ${policy.name}`, () => {
      navigateToTestPage(policy.path)
      cy.url().should('match', /\/check-answers$/)

      verifyPageContent(policy.staffs)

      cy.contains('dt', 'Name').next().should('include.text', 'Doe, Joe')

      if (policy.path === 'personal-officer') {
        cy.contains('dt', 'Role').should('not.exist')
      } else {
        cy.contains('dt', 'Role').next().should('include.text', 'Prison officer')
      }

      cy.contains('dt', 'Working pattern').next().should('include.text', 'Full-time')
      cy.contains('dt', 'Maximum capacity').next().should('include.text', '9')

      cy.findByRole('link', { name: /Change the staff member$/i })
        .should('be.visible')
        .and('have.attr', 'href')
        .and('to.match', /..\/assign$/)

      if (policy.path !== 'personal-officer') {
        cy.findByRole('link', { name: /Change whether the staff member is a prison officer/i })
          .should('be.visible')
          .and('have.attr', 'href')
          .and('to.match', /role$/)
      }

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
          capacity: 9,
          staffRole: {
            position: 'PRO',
            scheduleType: 'FT',
            hoursPerWeek: 35,
          },
        },
      )
    })
  })

  const verifyPageContent = (policyName: string = 'Key workers') => {
    cy.title().should('match', new RegExp(`Check your answers - ${policyName} - DPS`, 'i'))
    cy.findByRole('heading', { name: 'Check your answers' }).should('be.visible')
    cy.findByRole('button', { name: 'Confirm and submit' }).should('be.visible')
  }

  const proceedToNextPage = () => {
    cy.findByRole('button', { name: 'Confirm and submit' }).click()
    cy.url().should('match', /\/confirmation$/)
  }

  const navigateToTestPage = (policyPath: string = 'key-worker') => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(`/${policyPath}/${journeyId}/manage-roles/assign`, {
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
        ...(policyPath === 'key-worker' ? { isPrisonOfficer: true } : {}),
        scheduleType: { code: 'FT', description: 'Full-time' },
        hoursPerWeek: 35,
        capacity: 9,
      },
    })

    cy.visit(`/${policyPath}/${journeyId}/manage-roles/assign/check-answers`, { failOnStatusCode: false })
  }
})
