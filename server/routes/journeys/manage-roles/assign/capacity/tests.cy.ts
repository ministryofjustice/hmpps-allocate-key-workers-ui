import { v4 as uuidV4 } from 'uuid'
import { PartialJourneyData } from '../../../../../../integration_tests/support/commands'

context('/manage-roles/assign/capacity', () => {
  const capacityInput = () =>
    cy.findByRole('textbox', {
      name: 'What is the maximum number of prisoners this prison officer should be assigned?',
    })
  const continueButton = () => cy.findByRole('button', { name: 'Continue' })

  const journeyId = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
  })

  it('should try all cases', () => {
    navigateToTestPage()
    cy.url().should('match', /\/assign\/capacity/)

    verifyPageContent()

    verifyValidationErrors()

    proceedToNextPage()

    verifyInputValuesArePersisted()
  })

  const verifyPageContent = () => {
    cy.title().should('equal', 'Set maximum capacity - Key workers - DPS')

    cy.findByRole('heading', {
      name: 'What is the maximum number of prisoners this prison officer should be assigned?',
    }).should('be.visible')

    capacityInput().should('be.visible').and('have.value', 6)
    continueButton().should('be.visible')

    cy.findByRole('link', { name: 'Back' })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /working-pattern/)
  }

  const verifyValidationErrors = () => {
    capacityInput().clear()
    continueButton().click()
    cy.findByRole('link', { name: /Enter a number for this prison officer’s capacity$/i })
      .should('be.visible')
      .click()
    capacityInput().should('be.focused')
  }

  const proceedToNextPage = () => {
    capacityInput().type('9')
    continueButton().click()
    cy.url().should('match', /\/check-answers/)
  }

  const verifyInputValuesArePersisted = () => {
    cy.go('back')
    capacityInput().should('have.value', '9')
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
      },
    })

    cy.visit(`/key-worker/${journeyId}/manage-roles/assign/capacity`)
  }
})
