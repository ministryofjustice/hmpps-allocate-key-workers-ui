import { v4 as uuidV4 } from 'uuid'
import { PartialJourneyData } from '../../../../../integration_tests/support/commands'

context('/update-capacity-status-and-working-pattern/update-status-unavailable', () => {
  const dayInput = () => cy.findByRole('textbox', { name: 'Day' })
  const monthInput = () => cy.findByRole('textbox', { name: 'Month' })
  const yearInput = () => cy.findByRole('textbox', { name: 'Year' })
  const continueButton = () => cy.findByRole('button', { name: 'Continue' })
  const cancelButton = () => cy.findByRole('button', { name: 'Cancel' })

  const journeyId = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task('stubKeyworkerDetailsWithoutStats')
    cy.task('stubKeyworkerStatuses')
  })

  it('should try all cases', () => {
    navigateToTestPage()
    cy.url().should('match', /\/update-status-annual-leave-return/)

    verifyPageContent()

    verifyValidationErrors()

    proceedToNextPage()

    verifyInputValuesArePersisted()
  })

  const verifyPageContent = () => {
    cy.title().should('equal', 'Return date - Key workers - DPS')
    cy.findByRole('heading', {
      name: 'When will Available-Active Key-Worker return from annual leave?',
    }).should('be.visible')

    dayInput().should('be.visible').and('have.value', '')
    monthInput().should('be.visible').and('have.value', '')
    yearInput().should('be.visible').and('have.value', '')

    continueButton().should('be.visible')
    cancelButton()
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /cancel/)
  }

  const verifyValidationErrors = () => {
    dayInput().type('10')
    monthInput().type('12')
    continueButton().click()
    cy.findByRole('link', { name: /Return date must include a year$/i })
      .should('be.visible')
      .click()
    yearInput().should('be.focused')
  }

  const proceedToNextPage = () => {
    yearInput().type('2070')
    continueButton().click()
    cy.url().should('match', /\/check-answers/)
  }

  const verifyInputValuesArePersisted = () => {
    cy.go('back')
    dayInput().should('have.value', '10')
    monthInput().should('have.value', '12')
    yearInput().should('have.value', '2070')
  }

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.navigateWithHistory(
      `/key-worker/${journeyId}/start-update-staff/488095?proceedTo=update-capacity-status-and-working-pattern`,
      [
        '/key-worker',
        '/key-worker/manage',
        '/key-worker/staff-profile/488095',
        '/key-worker/start-update-staff/488095?proceedTo=update-capacity-status-and-working-pattern',
      ],
    )

    cy.injectJourneyDataAndReload<PartialJourneyData>(journeyId, {
      updateStaffDetails: {
        status: {
          code: 'UNAVAILABLE_ANNUAL_LEAVE',
          description: 'Unavailable (annual leave)',
        },
        deactivateActiveAllocations: false,
      },
    })

    cy.navigateWithHistory(
      `/key-worker/${journeyId}/update-capacity-status-and-working-pattern/update-status-annual-leave-return`,
      ['/key-worker'],
    )
  }
})
