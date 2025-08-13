import { v4 as uuidV4 } from 'uuid'

context('/update-capacity-status-and-working-pattern/update-working-pattern', () => {
  const journeyId = uuidV4()

  const fullTimeRadio = () => cy.findByRole('radio', { name: 'Full-time' })
  const partTimeRadio = () => cy.findByRole('radio', { name: 'Part-time' })
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
    cy.url().should('match', /\/update-working-pattern/)

    verifyPageContent()

    proceedToNextPage()

    cy.verifyLastAPICall(
      { method: 'PUT', urlPath: '/keyworker-api/prisons/LEI/staff/488095' },
      {
        staffRole: {
          scheduleType: 'PT',
          hoursPerWeek: 6,
        },
      },
    )
  })

  const verifyPageContent = () => {
    cy.title().should('equal', 'Update key worker working pattern - Key workers - DPS')
    cy.findByRole('heading', {
      name: 'What is Available-Active Key-Worker’s working pattern?',
    }).should('be.visible')

    fullTimeRadio().should('exist').and('be.checked')
    partTimeRadio().should('exist')
    continueButton().should('be.visible')
    cy.findByRole('button', { name: 'Cancel' })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/key-worker\/staff-profile\/488095/)
  }

  const proceedToNextPage = () => {
    partTimeRadio().click()
    continueButton().click()
    cy.url().should('match', /\/update-capacity-status-and-working-pattern/)
    cy.get('.govuk-notification-banner__heading')
      .should('be.visible')
      .and('contain.text', 'You have updated this key worker’s working pattern.')
  }

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.navigateWithHistory(
      `/key-worker/${journeyId}/start-update-staff/488095?proceedTo=update-capacity-status-and-working-pattern`,
      ['/key-worker'],
    )

    cy.navigateWithHistory(
      `/key-worker/${journeyId}/update-capacity-status-and-working-pattern/update-working-pattern`,
      ['/key-worker'],
    )
  }
})
