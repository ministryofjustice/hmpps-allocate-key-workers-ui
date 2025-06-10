import { v4 as uuidV4 } from 'uuid'
import { PartialJourneyData } from '../../../../../integration_tests/support/commands'

context('/update-capacity-status/update-status-unavailable', () => {
  const radioContinue = () => cy.findByRole('radio', { name: 'Continue automatically assigning them to prisoners' })
  const radioStop = () => cy.findByRole('radio', { name: 'Stop automatically assigning them to prisoners' })
  const radioDeallocate = () =>
    cy.findByRole('radio', {
      name: 'Stop automatically assigning them to prisoners and deallocate their current prisoners',
    })
  const continueButton = () => cy.findByRole('button', { name: 'Continue' })
  const cancelButton = () => cy.findByRole('button', { name: 'Cancel' })

  let journeyId = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task('stubKeyworkerDetails')
    cy.task('stubKeyworkerStatuses')
    cy.task('stubUpdateKeyworkerProperties')
  })

  it('should try non-annual-leave case', () => {
    navigateToTestPage('UNAVAILABLE_LONG_TERM_ABSENCE', 'Unavailable (long-term absence)')
    cy.url().should('match', /\/update-status-unavailable$/)

    verifyPageContent('Unavailable (long-term absence)')

    verifyValidationErrors()

    proceedToNextPage(/\/check-answers$/)

    verifyInputValuesArePersisted()
  })

  it('should try annual-leave case', () => {
    navigateToTestPage('UNAVAILABLE_ANNUAL_LEAVE', 'Unavailable (annual leave)')
    cy.url().should('match', /\/update-status-unavailable$/)

    verifyPageContent('Unavailable (annual leave)')

    verifyValidationErrors()

    proceedToNextPage(/\/update-status-annual-leave-return$/)

    verifyInputValuesArePersisted()
  })

  const verifyPageContent = (statusDescription: string) => {
    cy.title().should('equal', `Change this key worker’s status to ${statusDescription} - Key worker profile - DPS`)
    cy.findByRole('heading', { name: 'Available-Active Key-Worker' }).should('be.visible')
    cy.get('.status-tag').eq(0).should('have.text', 'Active')

    cy.findByRole('heading', {
      name: `This key worker’s status is changing to ${statusDescription}. Do you want to continue automatically assigning them to prisoners?`,
    }).should('be.visible')

    radioContinue().should('exist')
    radioStop().should('exist')
    radioDeallocate().should('exist')

    continueButton().should('be.visible')
    cancelButton()
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /cancel$/)
  }

  const verifyValidationErrors = () => {
    continueButton().click()
    cy.findByRole('link', {
      name: /Select whether you want to continue automatically assigning the key worker to prisoners$/i,
    })
      .should('be.visible')
      .click()
    radioContinue().should('be.focused')
  }

  const proceedToNextPage = (nextPage: RegExp) => {
    radioContinue().click()
    continueButton().click()
    cy.url().should('match', nextPage)
  }

  const verifyInputValuesArePersisted = () => {
    cy.go('back')
    radioContinue().should('be.checked')
  }

  const navigateToTestPage = (statusCode: string, statusDescription: string) => {
    journeyId = uuidV4()

    cy.signIn({ failOnStatusCode: false })
    cy.visit(`/key-worker/${journeyId}/start-update-key-worker/488095?proceedTo=update-capacity-status`, {
      failOnStatusCode: false,
    })

    cy.injectJourneyDataAndReload<PartialJourneyData>(journeyId, {
      updateCapacityStatus: {
        status: {
          code: statusCode,
          description: statusDescription,
        },
        capacity: 999,
      },
    })

    cy.visit(`/key-worker/${journeyId}/update-capacity-status/update-status-unavailable`)
  }
})
