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

  const journeyId = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task('stubKeyworkerDetails')
    cy.task('stubKeyworkerStatuses')
    cy.task('stubUpdateKeyworkerProperties')
  })

  it('should try all cases', () => {
    navigateToTestPage()
    cy.url().should('match', /\/update-status-unavailable$/)

    verifyPageContent()

    verifyValidationErrors()

    proceedToNextPage()
  })

  const verifyPageContent = () => {
    cy.title().should(
      'equal',
      'Change this key worker’s status to Unavailable (long-term absence) - Key worker profile - DPS',
    )
    cy.findByRole('heading', { name: 'Available-Active Key-Worker' }).should('be.visible')
    cy.get('.status-tag').eq(0).should('have.text', 'Active')

    cy.findByRole('heading', {
      name: 'This key worker’s status is changing to Unavailable (long-term absence). Do you want to continue automatically assigning them to prisoners?',
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

  const proceedToNextPage = () => {
    radioContinue().click()
    continueButton().click()
    cy.url().should('match', /\/check-answers$/)
  }

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(`/${journeyId}/start-update-key-worker/488095?proceedTo=update-capacity-status`, {
      failOnStatusCode: false,
    })

    cy.injectJourneyDataAndReload<PartialJourneyData>(journeyId, {
      updateCapacityStatus: {
        status: {
          code: 'UNAVAILABLE_LONG_TERM_ABSENCE',
          description: 'Unavailable (long-term absence)',
        },
        capacity: 999,
      },
    })

    cy.visit(`/${journeyId}/update-capacity-status/update-status-unavailable`)
  }
})
