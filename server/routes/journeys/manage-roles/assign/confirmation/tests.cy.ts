import { v4 as uuidV4 } from 'uuid'
import { PartialJourneyData } from '../../../../../../integration_tests/support/commands'
import { checkAxeAccessibility } from '../../../../../../integration_tests/support/accessibilityViolations'

context('/manage-roles/assign/confirmation', () => {
  const journeyId = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
  })

  it('should render confirmation page', () => {
    navigateToTestPage()
    cy.url().should('match', /\/confirmation/)

    cy.title().should('equal', 'Confirmation - Key workers - DPS')
    cy.findByText('Key worker role assigned').should('be.visible')
    cy.findByText('You have successfully made Doe, Joe a key worker').should('be.visible')

    cy.findByRole('link', { name: /allocate prisoners to key workers/ })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/key-worker\/allocate/)

    cy.findByRole('link', { name: /View this individual’s key worker profile/ })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/key-worker\/staff-profile\/1001/)

    cy.findByRole('link', { name: /Return to key workers homepage/ })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/key-worker/)
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
        isPrisonOfficer: true,
        scheduleType: { code: 'FT', description: 'Full-time' },
        hoursPerWeek: 35,
      },
    })

    cy.visit(`/key-worker/${journeyId}/manage-roles/assign/confirmation`)
    checkAxeAccessibility()
  }
})
