import { v4 as uuidV4 } from 'uuid'
import { PartialJourneyData } from '../../../../../integration_tests/support/commands'

context('/assign-staff-role/role', () => {
  const radioPrisonOfficer = () => cy.findByRole('radio', { name: 'Prison Officer' })
  const radioProbationOfficer = () => cy.findByRole('radio', { name: 'Probation Officer' })
  const radioOther = () => cy.findByRole('radio', { name: 'Other' })
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
    cy.url().should('match', /\/assign-staff-role\/role$/)

    verifyPageContent()

    verifyValidationErrors()

    proceedToNextPage()

    verifyInputValuesArePersisted()
  })

  it('should proceed to expanded select role page when OTHER is selected', () => {
    navigateToTestPage()

    verifyPageContent()

    radioOther().click()
    continueButton().click()

    cy.url().should('match', /other-role$/)
  })

  const verifyPageContent = () => {
    cy.title().should('equal', `What is this individual’s role? - Key worker - DPS`)
    cy.findByRole('heading', { name: 'What is this individual’s role?' }).should('be.visible')

    radioPrisonOfficer().should('exist')
    radioProbationOfficer().should('exist')
    radioOther().should('exist')

    continueButton().should('be.visible')
  }

  const verifyValidationErrors = () => {
    continueButton().click()
    cy.findByRole('link', {
      name: /Select a role$/i,
    })
      .should('be.visible')
      .click()
    radioPrisonOfficer().should('be.focused')
  }

  const proceedToNextPage = () => {
    radioPrisonOfficer().click()
    continueButton().click()
    cy.url().should('match', /working-pattern$/)
  }

  const verifyInputValuesArePersisted = () => {
    cy.go('back')
    radioPrisonOfficer().should('be.checked')
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

    cy.visit(`/${journeyId}/key-worker/assign-staff-role/role`)
  }
})
