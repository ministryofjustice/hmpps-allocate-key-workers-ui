import { v4 as uuidV4 } from 'uuid'
import { PartialJourneyData } from '../../../../../integration_tests/support/commands'

context('/assign-staff-role/role', () => {
  const radioRole = () => cy.findByRole('radio', { name: 'Support Grade Band 2' })
  const radioRole2 = () => cy.findByRole('radio', { name: 'Industrial Grade 5' })
  const continueButton = () => cy.findByRole('button', { name: 'Continue' })

  let journeyId = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task('stubStaffPositions')
  })

  it('should select a role and proceed to next page', () => {
    navigateToTestPage()
    cy.url().should('match', /\/assign-staff-role\/other-role$/)

    verifyPageContent()

    verifyValidationErrors()

    proceedToNextPage()

    verifyInputValuesArePersisted()
  })

  const verifyPageContent = () => {
    cy.title().should('equal', `What is this individual’s role? - Key worker - DPS`)
    cy.findByRole('heading', { name: 'What is this individual’s role?' }).should('be.visible')

    radioRole().should('exist')
    radioRole2().should('exist')

    continueButton().should('be.visible')
  }

  const verifyValidationErrors = () => {
    continueButton().click()
    cy.findByRole('link', {
      name: /Select a role$/i,
    })
      .should('be.visible')
      .click()
    radioRole().should('be.focused')
  }

  const proceedToNextPage = () => {
    radioRole().click()
    continueButton().click()
    cy.url().should('match', /working-pattern$/)
  }

  const verifyInputValuesArePersisted = () => {
    cy.go('back')
    radioRole().should('be.checked')
  }

  const navigateToTestPage = () => {
    journeyId = uuidV4()

    cy.signIn({ failOnStatusCode: false })
    cy.visit(`/${journeyId}/key-worker/assign-staff-role`, {
      failOnStatusCode: false,
    })

    cy.injectJourneyDataAndReload<PartialJourneyData>(journeyId, {
      assignStaffRole: {
        staff: {
          staffId: 1001,
          firstName: 'Joe',
          lastName: 'Doe',
          username: 'JOE_DOE',
        },
      },
    })

    cy.visit(`/${journeyId}/key-worker/assign-staff-role/other-role`)
  }
})
