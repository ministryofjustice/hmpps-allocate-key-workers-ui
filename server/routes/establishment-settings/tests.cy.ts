import AuthorisedRoles from '../../authentication/authorisedRoles'

context('/establishment-settings', () => {
  const getCapacityInput = (policyName: string = 'key worker') =>
    cy.findByRole('textbox', { name: `Maximum number of prisoners to be allocated to each ${policyName}` })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubKeyworkerApiStatusIsKeyworker')
    cy.task('stubPutPrisonConfiguration')
  })

  it('should test admin view', () => {
    cy.task('stubEnabledPrison')
    cy.task('stubSignIn', {
      roles: [AuthorisedRoles.KW_MIGRATION],
    })

    navigateToTestPage()
    cy.url().should('match', /\/establishment-settings$/)

    verifyPageCommonContent()

    cy.findByRole('combobox', { name: 'How often should key worker sessions take place?' })
      .should('be.visible')
      .and('have.value', '1WK')
    cy.findByText('Key worker sessions at Leeds (HMP) take place every 1 week.').should('not.exist')

    verifyValidationErrors()

    cy.findByRole('radio', { name: 'No' }).click()
    getCapacityInput().clear().type('12')
    cy.findByRole('combobox', { name: 'How often should key worker sessions take place?' }).select('Every 3 weeks')

    cy.findByRole('button', { name: 'Save' }).click()

    cy.get('.govuk-notification-banner__heading')
      .should('be.visible')
      .and('contain.text', 'Establishment settings updated')

    cy.verifyLastAPICall(
      { method: 'PUT', urlPath: '/keyworker-api/prisons/LEI/configurations' },
      {
        isEnabled: true,
        hasPrisonersWithHighComplexityNeeds: false,
        allowAutoAllocation: false,
        capacity: 12,
        frequencyInWeeks: 3,
      },
    )
  })

  it('should test non-admin view', () => {
    cy.task('stubEnabledPrison')
    cy.task('stubSignIn', {
      roles: [AuthorisedRoles.OMIC_ADMIN],
    })

    navigateToTestPage()
    cy.url().should('match', /\/establishment-settings$/)

    verifyPageCommonContent()

    cy.findByRole('combobox', { name: 'How often should key worker sessions take place?' }).should('not.exist')
    cy.findByText('Key worker sessions at Leeds (HMP) take place every 1 week.').should('be.visible')

    verifyValidationErrors()

    cy.findByRole('radio', { name: 'No' }).click()
    getCapacityInput().clear().type('12')

    cy.findByRole('button', { name: 'Save' }).click()

    cy.get('.govuk-notification-banner__heading')
      .should('be.visible')
      .and('contain.text', 'Establishment settings updated')

    cy.verifyLastAPICall(
      { method: 'PUT', urlPath: '/keyworker-api/prisons/LEI/configurations' },
      {
        isEnabled: true,
        hasPrisonersWithHighComplexityNeeds: false,
        allowAutoAllocation: false,
        capacity: 12,
        frequencyInWeeks: 1,
      },
    )
  })

  it('should allow admin to enable service in a prison', () => {
    cy.task('stubPrisonNotEnabled')
    cy.task('stubSignIn', {
      roles: [AuthorisedRoles.KW_MIGRATION],
    })

    navigateToTestPage('personal-officer')
    cy.url().should('match', /\/establishment-settings$/)

    cy.findByRole('heading', { name: 'Establishment settings for Leeds (HMP)' }).should('be.visible')
    cy.findByRole('radio', { name: 'Yes' }).should('exist').and('be.checked')
    getCapacityInput('personal officer').should('be.visible').and('have.value', '6')
    cy.findByRole('button', { name: 'Save' }).should('be.visible')
    cy.findByRole('button', { name: 'Cancel' })
      .should('be.visible')
      .and('have.attr', 'href')
      .should('equal', '/personal-officer')

    cy.findByRole('combobox', { name: 'How often should personal officer sessions take place?' })
      .should('be.visible')
      .and('have.value', '1WK')

    getCapacityInput('personal officer').clear().type('-1')
    cy.findByRole('button', { name: 'Save' }).click()

    cy.findByRole('link', { name: /Enter a number between 1 and 999$/i })
      .should('be.visible')
      .click()
    getCapacityInput('personal officer').should('be.focused')

    cy.findByRole('radio', { name: 'No' }).click()
    getCapacityInput('personal officer').clear().type('12')
    cy.findByRole('combobox', { name: 'How often should personal officer sessions take place?' }).select(
      'Every 3 weeks',
    )

    cy.findByRole('button', { name: 'Save' }).click()

    cy.get('.govuk-notification-banner__heading')
      .should('be.visible')
      .and('contain.text', 'Establishment settings updated')

    cy.verifyLastAPICall(
      { method: 'PUT', urlPath: '/keyworker-api/prisons/LEI/configurations' },
      {
        isEnabled: true,
        hasPrisonersWithHighComplexityNeeds: false,
        allowAutoAllocation: false,
        capacity: 12,
        frequencyInWeeks: 3,
      },
    )
  })

  const verifyPageCommonContent = () => {
    cy.title().should('equal', 'Manage your establishment’s key worker settings - Key workers - DPS')
    cy.findByRole('heading', { name: 'Establishment settings for Leeds (HMP)' }).should('be.visible')
    cy.findByRole('radio', { name: 'Yes' }).should('exist').and('be.checked')
    getCapacityInput().should('be.visible').and('have.value', '6')
    cy.findByRole('button', { name: 'Save' }).should('be.visible')
    cy.findByRole('button', { name: 'Cancel' })
      .should('be.visible')
      .and('have.attr', 'href')
      .should('equal', '/key-worker')
  }

  const verifyValidationErrors = () => {
    getCapacityInput().clear().type('-1')
    cy.findByRole('button', { name: 'Save' }).click()

    cy.findByRole('link', { name: /Enter a number between 1 and 999$/i })
      .should('be.visible')
      .click()
    getCapacityInput().should('be.focused')
  }

  const navigateToTestPage = (policy: string = 'key-worker') => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(`/${policy}/establishment-settings`, { failOnStatusCode: false })
  }
})
