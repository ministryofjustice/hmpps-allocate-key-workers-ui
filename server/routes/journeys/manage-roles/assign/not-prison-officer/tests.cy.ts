import { v4 as uuidV4 } from 'uuid'
import { PartialJourneyData } from '../../../../../../integration_tests/support/commands'

context('/manage-roles/assign/not-prison-officer', () => {
  const journeyId = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
  })

  it('should render error page', () => {
    navigateToTestPage()
    cy.url().should('match', /\/assign\/not-prison-officer/)

    cy.title().should('equal', 'Not a prison officer - Key workers - DPS')

    cy.findByRole('heading', {
      name: 'You cannot make this person a key worker',
    }).should('be.visible')

    cy.findByRole('link', { name: 'Return to key workers homepage' })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /key-worker/)
    cy.findByRole('link', { name: 'Back' }).should('be.visible').and('have.attr', 'href').and('match', /role/)
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

    cy.visit(`/key-worker/${journeyId}/manage-roles/assign/not-prison-officer`)
  }
})
