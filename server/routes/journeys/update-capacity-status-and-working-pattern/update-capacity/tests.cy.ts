import { v4 as uuidV4 } from 'uuid'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('/update-capacity-status-and-working-pattern/update-capacity', () => {
  const journeyId = uuidV4()

  const capacityInput = () =>
    cy.findByRole('textbox', {
      name: 'What is the maximum number of prisoners Available-Active Key-Worker should be assigned?',
    })
  const continueButton = () => cy.findByRole('button', { name: 'Confirm and save' })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task('stubKeyworkerDetailsWithoutStats')
    cy.task('stubKeyworkerStatuses')
    cy.task('stubUpsertStaffDetails')
  })

  it('should try all cases', () => {
    navigateToTestPage()
    cy.url().should('match', /\/update-capacity/)

    verifyPageContent()

    verifyValidationErrors()

    proceedToNextPage()

    cy.verifyLastAPICall(
      { method: 'PUT', urlPath: '/keyworker-api/prisons/LEI/staff/488095' },
      {
        capacity: 12,
      },
    )
  })

  const verifyPageContent = () => {
    cy.title().should('equal', 'Update key worker capacity - Key workers - DPS')
    cy.findByRole('heading', {
      name: 'What is the maximum number of prisoners Available-Active Key-Worker should be assigned?',
    }).should('be.visible')

    capacityInput().should('be.visible')
    continueButton().should('be.visible')
    cy.findByRole('button', { name: 'Cancel' })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /key-worker\/staff-profile\/488095/)
  }

  const verifyValidationErrors = () => {
    capacityInput().clear()
    continueButton().click()
    cy.findByRole('link', { name: /Enter a number$/i })
      .should('be.visible')
      .click()
    capacityInput().should('be.focused')
  }

  const proceedToNextPage = () => {
    capacityInput().clear().type('12')
    continueButton().click()
    cy.url().should('match', /\/update-capacity-status-and-working-pattern\?/)
    cy.get('.govuk-notification-banner__heading')
      .should('be.visible')
      .and('contain.text', 'You have updated this key worker’s maximum capacity.')
  }

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(
      `/key-worker/${journeyId}/start-update-staff/488095?proceedTo=update-capacity-status-and-working-pattern`,
      {
        failOnStatusCode: false,
      },
    )

    cy.visit(`/key-worker/${journeyId}/update-capacity-status-and-working-pattern/update-capacity`)
    checkAxeAccessibility()
  }
})
