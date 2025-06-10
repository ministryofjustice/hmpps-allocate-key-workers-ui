import { v4 as uuidV4 } from 'uuid'

context('/update-capacity-status/** journey', () => {
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

  it('should update active status and capacity', () => {
    beginJourney()

    cy.get('#capacity').clear().type('8')
    cy.get('#status').select('ACTIVE')
    cy.findByRole('button', { name: /Save and continue/i }).click()

    cy.get('.govuk-notification-banner__heading')
      .should('be.visible')
      .and('contain.text', 'You have updated this key worker’s capacity.')

    cy.verifyLastAPICall(
      { method: 'PUT', urlPath: '/keyworker-api/prisons/LEI/keyworkers/488095' },
      {
        status: 'ACTIVE',
        capacity: 8,
        deactivateActiveAllocations: false,
        removeFromAutoAllocation: false,
      },
    )
  })

  it('should update inactive status and capacity', () => {
    beginJourney()

    cy.get('#capacity').clear().type('8')
    cy.get('#status').select('INACTIVE')
    cy.findByRole('button', { name: /Save and continue/i }).click()
    cy.findByRole('button', { name: 'Yes, save this change' }).click()

    cy.get('.govuk-notification-banner__heading')
      .should('be.visible')
      .and('contain.text', 'You have updated this key worker’s status and capacity.')

    cy.verifyLastAPICall(
      { method: 'PUT', urlPath: '/keyworker-api/prisons/LEI/keyworkers/488095' },
      {
        status: 'INACTIVE',
        capacity: 8,
        deactivateActiveAllocations: true,
        removeFromAutoAllocation: true,
      },
    )
  })

  it('should update unavailable (non annual leave) status and capacity', () => {
    beginJourney()

    cy.get('#capacity').clear().type('8')
    cy.get('#status').select('UNAVAILABLE_NO_PRISONER_CONTACT')
    cy.findByRole('button', { name: /Save and continue/i }).click()
    cy.findByRole('radio', { name: 'Continue automatically assigning them to prisoners' }).click()
    cy.findByRole('button', { name: 'Continue' }).click()

    // Can change answers
    cy.findByRole('link', { name: /Change the new status/i }).click()
    cy.get('#status').select('UNAVAILABLE_LONG_TERM_ABSENCE')
    cy.findByRole('button', { name: /Save and continue/i }).click()

    cy.findByRole('link', { name: /Change whether to continue automatically assigning prisoners/i }).click()
    cy.findByRole('radio', { name: 'Stop automatically assigning them to prisoners' }).click()
    cy.findByRole('button', { name: 'Continue' }).click()

    // Confirm and submit
    cy.findByRole('button', { name: 'Confirm and submit' }).click()

    cy.get('.govuk-notification-banner__heading')
      .should('be.visible')
      .and('contain.text', 'You have updated this key worker’s status and capacity.')

    cy.verifyLastAPICall(
      { method: 'PUT', urlPath: '/keyworker-api/prisons/LEI/keyworkers/488095' },
      {
        status: 'UNAVAILABLE_LONG_TERM_ABSENCE',
        capacity: 8,
        deactivateActiveAllocations: true,
        removeFromAutoAllocation: false,
      },
    )
  })

  it('should update unavailable (annual leave) status and capacity', () => {
    beginJourney()

    cy.get('#capacity').clear().type('8')
    cy.get('#status').select('UNAVAILABLE_ANNUAL_LEAVE')
    cy.findByRole('button', { name: /Save and continue/i }).click()
    cy.findByRole('radio', { name: 'Continue automatically assigning them to prisoners' }).click()
    cy.findByRole('button', { name: 'Continue' }).click()
    cy.findByRole('textbox', { name: 'Day' }).clear().type('1')
    cy.findByRole('textbox', { name: 'Month' }).clear().type('1')
    cy.findByRole('textbox', { name: 'Year' }).clear().type('2070')
    cy.findByRole('button', { name: 'Continue' }).click()

    // Can change answers
    cy.findByRole('link', { name: /Change the return date/i }).click()
    cy.findByRole('textbox', { name: 'Day' }).clear().type('9')
    cy.findByRole('textbox', { name: 'Month' }).clear().type('9')
    cy.findByRole('textbox', { name: 'Year' }).clear().type('2071')
    cy.findByRole('button', { name: 'Continue' }).click()

    // Confirm and submit
    cy.findByRole('button', { name: 'Confirm and submit' }).click()

    cy.get('.govuk-notification-banner__heading')
      .should('be.visible')
      .and('contain.text', 'You have updated this key worker’s status and capacity.')

    cy.verifyLastAPICall(
      { method: 'PUT', urlPath: '/keyworker-api/prisons/LEI/keyworkers/488095' },
      {
        status: 'UNAVAILABLE_ANNUAL_LEAVE',
        capacity: 8,
        deactivateActiveAllocations: false,
        removeFromAutoAllocation: false,
        reactivateOn: '2071-09-09T00:00:00.000Z',
      },
    )
  })

  const beginJourney = () => {
    journeyId = uuidV4()
    cy.signIn({ failOnStatusCode: false })
    cy.visit(`/key-worker/${journeyId}/start-update-key-worker/488095?proceedTo=update-capacity-status`, {
      failOnStatusCode: false,
    })
  }
})
