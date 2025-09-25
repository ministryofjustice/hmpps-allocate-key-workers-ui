import { v4 as uuidV4 } from 'uuid'
import { PartialJourneyData } from '../../../../../integration_tests/support/commands'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('/update-capacity-status-and-working-pattern/update-status-unavailable', () => {
  const notDeallocateRadio = () => cy.findByRole('radio', { name: 'Do not deallocate their current prisoners' })
  const deallocateRadio = () => cy.findByRole('radio', { name: 'Deallocate their current prisoners' })
  const continueButton = () => cy.findByRole('button', { name: 'Continue' })
  const cancelButton = () => cy.findByRole('button', { name: 'Cancel' })

  let journeyId = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task('stubKeyworkerDetailsWithoutStats')
    cy.task('stubKeyworkerStatuses')
  })

  it('should try non-annual-leave case', () => {
    navigateToTestPage('UNAVAILABLE_LONG_TERM_ABSENCE', 'Unavailable - long-term absence')
    cy.url().should('match', /\/update-status-unavailable/)

    verifyPageContent()

    verifyValidationErrors()

    proceedToNextPage(/\/check-answers/)

    verifyInputValuesArePersisted()
  })

  it('should try annual-leave case', () => {
    navigateToTestPage('UNAVAILABLE_ANNUAL_LEAVE', 'Unavailable - annual leave')
    cy.url().should('match', /\/update-status-unavailable/)

    verifyPageContent()

    verifyValidationErrors()

    proceedToNextPage(/\/update-status-annual-leave-return/)

    verifyInputValuesArePersisted()
  })

  const verifyPageContent = () => {
    cy.title().should('equal', `Deallocate prisoners - Key workers - DPS`)
    cy.findByRole('heading', {
      name: `Available-Active Key-Worker will now no longer be automatically assigned prisoners. Do you also want to deallocate prisoners currently allocated to them?`,
    }).should('be.visible')

    notDeallocateRadio().should('exist')
    deallocateRadio().should('exist')

    continueButton().should('be.visible')
    cancelButton()
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /cancel/)
  }

  const verifyValidationErrors = () => {
    continueButton().click()
    cy.findByRole('link', {
      name: /Select if you want to deallocate their current prisoners$/i,
    })
      .should('be.visible')
      .click()
    notDeallocateRadio().should('be.focused')
  }

  const proceedToNextPage = (nextPage: RegExp) => {
    notDeallocateRadio().click()
    continueButton().click()
    cy.url().should('match', nextPage)
  }

  const verifyInputValuesArePersisted = () => {
    cy.go('back')
    notDeallocateRadio().should('be.checked')
  }

  const navigateToTestPage = (statusCode: string, statusDescription: string) => {
    journeyId = uuidV4()

    cy.signIn({ failOnStatusCode: false })
    cy.visit(
      `/key-worker/${journeyId}/start-update-staff/488095?proceedTo=update-capacity-status-and-working-pattern`,
      {
        failOnStatusCode: false,
      },
    )

    cy.injectJourneyDataAndReload<PartialJourneyData>(journeyId, {
      updateStaffDetails: {
        status: {
          code: statusCode,
          description: statusDescription,
        },
      },
    })

    cy.visit(`/key-worker/${journeyId}/update-capacity-status-and-working-pattern/update-status-unavailable`)
    checkAxeAccessibility()
  }
})
