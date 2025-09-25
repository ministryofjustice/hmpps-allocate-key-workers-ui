import { v4 as uuidV4 } from 'uuid'
import { PartialJourneyData } from '../../../../../integration_tests/support/commands'
import AuthorisedRoles from '../../../../authentication/authorisedRoles'
import { checkAxeAccessibility } from '../../../../../integration_tests/support/accessibilityViolations'

context('/select-services/confirmation', () => {
  const journeyId = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn', {
      roles: [AuthorisedRoles.KW_MIGRATION],
    })
    cy.task('stubPrisonNotEnabled')
    cy.task('stubGetPolicies')
  })

  it(`should try all cases`, () => {
    navigateToTestPage()
    cy.url().should('match', /\/confirmation/)

    cy.title().should('match', /Confirmation - Key workers - DPS/i)
    cy.findByRole('heading', { name: 'Key worker activated and personal officer deactivated in Leeds (HMP)' }).should(
      'be.visible',
    )

    cy.findByText('Users in this establishment now have access to the key worker service').should('be.visible')

    cy.findByRole('link', { name: /Manage your establishment’s key worker settings/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('to.match', /\/key-worker\/establishment-settings/)

    cy.findByRole('link', { name: /Manage your establishment’s personal officer settings/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('to.match', /\/personal-officer\/establishment-settings/)
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(`/key-worker/select-services`, {
      failOnStatusCode: false,
    })

    cy.injectJourneyDataAndReload<PartialJourneyData>(journeyId, {
      selectServices: {
        services: 'KW',
        keyWorkerEnabled: true,
        personalOfficerEnabled: true,
      },
    })

    cy.visit(`/key-worker/${journeyId}/select-services/confirmation`, { failOnStatusCode: false })
    checkAxeAccessibility()
  }
})
