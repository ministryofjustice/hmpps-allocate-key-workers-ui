import { v4 as uuidV4 } from 'uuid'
import { createMock } from '../../../../testutils/mockObjects'
import { defaultKeyworkerDetails } from '../../../../../integration_tests/mockApis/keyworkerApi'

context('/update-capacity-status-and-working-pattern/update-status', () => {
  const activeRadio = () => cy.findByRole('radio', { name: 'Active' })
  const unavailableRadio = () => cy.findByRole('radio', { name: 'Unavailable - annual leave' })
  const inactiveRadio = () => cy.findByRole('radio', { name: 'Inactive' })

  const continueButton = () => cy.findByRole('button', { name: 'Continue' })
  const cancelButton = () => cy.findByRole('button', { name: 'Cancel' })

  let journeyId = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task('stubKeyworkerStatuses')
  })

  it('should try ACTIVE case', () => {
    cy.task(
      'stubKeyworkerDetailsWithoutStats',
      createMock(defaultKeyworkerDetails, { status: { code: 'INACTIVE', description: 'Inactive' } }),
    )
    navigateToTestPage()
    cy.url().should('match', /\/update-status/)

    verifyPageContent()

    verifyValidationErrors()

    proceedToNextPage(/\/check-answers/)

    verifyInputValuesArePersisted()
  })

  it('should try UNAVAILABLE case', () => {
    cy.task(
      'stubKeyworkerDetailsWithoutStats',
      createMock(defaultKeyworkerDetails, { status: { code: 'INACTIVE', description: 'Inactive' } }),
    )
    navigateToTestPage()
    cy.url().should('match', /\/update-status/)

    unavailableRadio().click()
    continueButton().click()
    cy.url().should('match', /\/update-status-unavailable/)
  })

  it('should try INACTIVE case', () => {
    cy.task('stubKeyworkerDetailsWithoutStats')
    navigateToTestPage()
    cy.url().should('match', /\/update-status/)

    inactiveRadio().click()
    continueButton().click()
    cy.url().should('match', /\/update-status-inactive/)
  })

  const verifyPageContent = () => {
    cy.title().should('equal', `Update key worker status - Key workers - DPS`)
    cy.findByRole('heading', {
      name: `What is Available-Active Key-Worker’s new status?`,
    }).should('be.visible')

    continueButton().should('be.visible')
    cancelButton()
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /key-worker\/staff-profile\/488095/)
  }

  const verifyValidationErrors = () => {
    continueButton().click()
    cy.findByRole('link', {
      name: /Select a status$/i,
    })
      .should('be.visible')
      .click()
    activeRadio().should('be.focused')
  }

  const proceedToNextPage = (nextPage: RegExp) => {
    activeRadio().click()
    continueButton().click()
    cy.url().should('match', nextPage)
  }

  const verifyInputValuesArePersisted = () => {
    cy.findByRole('link', { name: /Back$/ }).click()
    activeRadio().should('be.checked')
  }

  const navigateToTestPage = () => {
    journeyId = uuidV4()

    cy.signIn({ failOnStatusCode: false })
    cy.visit(
      `/key-worker/${journeyId}/start-update-staff/488095?proceedTo=update-capacity-status-and-working-pattern`,
      {
        failOnStatusCode: false,
      },
    )

    cy.visit(`/key-worker/${journeyId}/update-capacity-status-and-working-pattern/update-status`)
  }
})
