import { v4 as uuidV4 } from 'uuid'
import AuthorisedRoles from '../../../authentication/authorisedRoles'
import { checkAxeAccessibility } from '../../../../integration_tests/support/accessibilityViolations'

context('/select-services', () => {
  const kwRadio = () => cy.findByRole('radio', { name: 'Key worker' })
  const poRadio = () => cy.findByRole('radio', { name: 'Personal officer' })
  const neitherRadio = () => cy.findByRole('radio', { name: 'Neither' })
  const continueButton = () => cy.findByRole('button', { name: 'Continue' })

  const journeyId = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn', {
      roles: [AuthorisedRoles.KW_MIGRATION],
    })
    cy.task('stubPrisonNotEnabled')
    cy.task('stubGetPolicies')
  })

  it('should try all cases', () => {
    navigateToTestPage()
    cy.url().should('match', /\/select-services/)

    verifyPageContent()

    verifyValidationErrors()

    proceedToNextPage()

    verifyInputValuesArePersisted()
  })

  const verifyPageContent = () => {
    cy.title().should('equal', 'Select services - Key workers - DPS')

    cy.findByRole('heading', {
      name: 'Select which services should be active in Leeds (HMP)',
    }).should('be.visible')

    kwRadio().should('exist')
    poRadio().should('exist')
    neitherRadio().should('exist')
    continueButton().should('be.visible')

    cy.findByRole('link', { name: 'Back' })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /establishment-settings/)
  }

  const verifyValidationErrors = () => {
    continueButton().click()
    cy.findByRole('link', { name: /Select which services should be active$/i })
      .should('be.visible')
      .click()
    kwRadio().should('be.focused')
  }

  const proceedToNextPage = () => {
    kwRadio().click()
    continueButton().click()
    cy.url().should('match', /\/check-answers/)
  }

  const verifyInputValuesArePersisted = () => {
    cy.go('back')
    kwRadio().should('be.checked')
    poRadio().should('not.be.checked')
  }

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(`/key-worker/${journeyId}/select-services`, {
      failOnStatusCode: false,
    })
    checkAxeAccessibility()
  }
})
