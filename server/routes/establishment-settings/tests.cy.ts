import { checkAxeAccessibility } from '../../../integration_tests/support/accessibilityViolations'
import { verifyRoleBasedAccess } from '../../../integration_tests/support/roleBasedAccess'
import AuthorisedRoles from '../../authentication/authorisedRoles'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'

context('/establishment-settings', () => {
  const getCapacityInput = (policyName: string = 'key worker') =>
    cy.findByRole('textbox', { name: `Maximum number of prisoners to be allocated to each ${policyName}` })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubPutPrisonConfiguration')
    cy.task('stubEnabledPrison')
    cy.task('stubGetPolicies')
  })

  describe('Role based access', () => {
    verifyRoleBasedAccess(`/key-worker/establishment-settings`, UserPermissionLevel.ALLOCATE)
  })

  it('should test admin view', () => {
    cy.task('stubEnabledPrison')
    cy.task('stubSignIn', {
      roles: [AuthorisedRoles.KW_MIGRATION],
    })

    navigateToTestPage()
    cy.url().should('match', /\/establishment-settings/)

    verifyPageCommonContent()

    cy.findByRole('combobox', { name: 'How often should key worker sessions take place?' })
      .should('be.visible')
      .and('have.value', '1WK')
    cy.findByText('Key worker sessions at Leeds (HMP) take place every 1 week.').should('not.exist')
    cy.findByRole('link', {
      name: 'Select if key worker, personal officer, both, or neither should be active in this establishment',
    }).should('be.visible')

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
        allocationOrder: 'BY_ALLOCATIONS',
      },
    )
  })

  it('should test personal-officer admin view', () => {
    cy.task('stubEnabledPrison')
    cy.task('stubSignIn', {
      roles: [AuthorisedRoles.KW_MIGRATION],
    })

    navigateToTestPage('personal-officer')
    cy.url().should('match', /\/establishment-settings/)

    verifyPageCommonContent('personal officer', 'personal-officer', 'Personal officers')

    cy.get('select').should('have.length', 0)

    verifyValidationErrors('personal officer')

    cy.findByRole('radio', { name: 'No' }).click()
    getCapacityInput('personal officer').clear().type('12')

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
        allocationOrder: 'BY_ALLOCATIONS',
      },
    )
  })

  it('should send API Call audit event', () => {
    cy.task('stubEnabledPrison')
    cy.task('stubSignIn', {
      roles: [AuthorisedRoles.KW_MIGRATION],
    })

    navigateToTestPage()
    cy.url().should('match', /\/establishment-settings/)
    cy.findByRole('button', { name: 'Save' }).click()

    cy.verifyAuditEvents([
      {
        who: 'USER1',
        subjectType: 'NOT_APPLICABLE',
        details:
          '{"pageUrl":"/key-worker/establishment-settings","pageName":"ESTABLISHMENT_SETTINGS","activeCaseLoadId":"LEI","policy":"KEY_WORKER"}',
        what: 'PAGE_VIEW',
        service: 'DPS023',
      },
      {
        who: 'USER1',
        subjectType: 'NOT_APPLICABLE',
        details:
          '{"pageUrl":"/key-worker/establishment-settings","pageName":"ESTABLISHMENT_SETTINGS","activeCaseLoadId":"LEI","policy":"KEY_WORKER"}',
        what: 'PAGE_VIEW_ACCESS_ATTEMPT',
        service: 'DPS023',
      },
      {
        what: 'API_CALL_ATTEMPT',
        who: 'USER1',
        subjectType: 'NOT_APPLICABLE',
        details: '{"apiUrl":"PUT /prisons/LEI/configurations","activeCaseLoadId":"LEI","policy":"KEY_WORKER"}',
        service: 'DPS023',
      },
      {
        what: 'API_CALL_SUCCESS',
        who: 'USER1',
        subjectType: 'NOT_APPLICABLE',
        details: '{"apiUrl":"PUT /prisons/LEI/configurations","activeCaseLoadId":"LEI","policy":"KEY_WORKER"}',
        service: 'DPS023',
      },
      {
        who: 'USER1',
        subjectType: 'NOT_APPLICABLE',
        details:
          '{"pageUrl":"/key-worker/establishment-settings","pageName":"ESTABLISHMENT_SETTINGS","activeCaseLoadId":"LEI","policy":"KEY_WORKER"}',
        what: 'PAGE_VIEW',
        service: 'DPS023',
      },
      {
        who: 'USER1',
        subjectType: 'NOT_APPLICABLE',
        details:
          '{"pageUrl":"/key-worker/establishment-settings","pageName":"ESTABLISHMENT_SETTINGS","activeCaseLoadId":"LEI","policy":"KEY_WORKER"}',
        what: 'PAGE_VIEW_ACCESS_ATTEMPT',
        service: 'DPS023',
      },
    ])
  })

  it('should test non-admin view', () => {
    cy.task('stubEnabledPrison')
    cy.task('stubSignIn', {
      roles: [AuthorisedRoles.OMIC_ADMIN],
    })

    navigateToTestPage()
    cy.url().should('match', /\/establishment-settings/)

    verifyPageCommonContent()

    cy.findByRole('combobox', { name: 'How often should key worker sessions take place?' }).should('not.exist')
    cy.findByText('Key worker sessions at Leeds (HMP) take place every 1 week.').should('be.visible')
    cy.findByRole('link', {
      name: 'Select if key worker, personal officer, both, or neither should be active in this establishment',
    }).should('not.exist')

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
        allocationOrder: 'BY_ALLOCATIONS',
      },
    )
  })

  it('should test personal officer non-admin view', () => {
    cy.task('stubEnabledPrison')
    cy.task('stubSignIn', {
      roles: [AuthorisedRoles.PERSONAL_OFFICER_ALLOCATE],
    })

    navigateToTestPage('personal-officer')
    cy.url().should('match', /\/establishment-settings/)

    verifyPageCommonContent('personal officer', 'personal-officer', 'Personal officers')

    cy.findByText('Personal officer sessions at Leeds (HMP) take place every 1 week.').should('not.exist')
  })

  it('should allow admin to enable service in a prison', () => {
    cy.task('stubPrisonNotEnabled')
    cy.task('stubSignIn', {
      roles: [AuthorisedRoles.KW_MIGRATION],
    })

    navigateToTestPage('personal-officer')
    cy.url().should('match', /\/establishment-settings/)

    cy.findByRole('heading', { name: 'Establishment settings for Leeds (HMP)' }).should('be.visible')
    cy.findByRole('radio', { name: 'Yes' }).should('exist').and('be.checked')
    getCapacityInput('personal officer').should('be.visible').and('have.value', '6')
    cy.findByRole('button', { name: 'Save' }).should('be.visible')
    cy.findByRole('button', { name: 'Cancel' })
      .should('be.visible')
      .and('have.attr', 'href')
      .should('match', /\/personal-officer/)

    getCapacityInput('personal officer').clear().type('-1')
    cy.findByRole('button', { name: 'Save' }).click()

    cy.findByRole('link', { name: /Enter a number between 1 and 999$/i })
      .should('be.visible')
      .click()
    getCapacityInput('personal officer').should('be.focused')

    cy.findByRole('radio', { name: 'No' }).click()
    getCapacityInput('personal officer').clear().type('12')

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
        allocationOrder: 'BY_ALLOCATIONS',
      },
    )
  })

  const verifyPageCommonContent = (
    policyStaff: string = 'key worker',
    policyUrl: string = 'key-worker',
    policyName: string = 'Key workers',
  ) => {
    cy.title().should('equal', `Manage your establishment’s ${policyStaff} settings - ${policyName} - DPS`)
    cy.findByRole('heading', { name: 'Establishment settings for Leeds (HMP)' }).should('be.visible')
    cy.findByRole('radio', { name: 'Yes' }).should('exist').and('be.checked')
    cy.findByRole('radio', { name: 'By number of current allocations' }).should('exist').and('be.checked')
    getCapacityInput(policyStaff).should('be.visible').and('have.value', '6')
    cy.findByRole('button', { name: 'Save' }).should('be.visible')
    cy.findByRole('button', { name: 'Cancel' })
      .should('be.visible')
      .and('have.attr', 'href')
      .should('match', new RegExp(`/${policyUrl}`))
  }

  const verifyValidationErrors = (policyStaff: string = 'key worker') => {
    getCapacityInput(policyStaff).clear().type('-1')
    cy.findByRole('button', { name: 'Save' }).click()

    cy.findByRole('link', { name: /Enter a number between 1 and 999$/i })
      .should('be.visible')
      .click()
    getCapacityInput(policyStaff).should('be.focused')
  }

  const navigateToTestPage = (policy: string = 'key-worker') => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(`/${policy}/establishment-settings`, { failOnStatusCode: false })
    checkAxeAccessibility()
  }
})
