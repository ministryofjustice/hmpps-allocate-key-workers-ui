import { v4 as uuidV4 } from 'uuid'
import { PartialJourneyData } from '../../../../../integration_tests/support/commands'
import AuthorisedRoles from '../../../../authentication/authorisedRoles'

context('/select-services/check-answers', () => {
  const journeyId = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn', {
      roles: [AuthorisedRoles.KW_MIGRATION],
    })
    cy.task('stubPrisonNotEnabled')
    cy.task('stubGetPolicies')
    cy.task('stubPutPolicies')
  })

  it(`should try all cases`, () => {
    navigateToTestPage()
    cy.url().should('match', /\/check-answers$/)

    verifyPageContent()

    cy.contains('dt', 'Active services in Leeds (HMP)').next().should('include.text', 'Key worker')
    cy.contains('dt', 'Inactive services in Leeds (HMP)').next().should('include.text', 'Personal officer')

    cy.findByRole('link', { name: /Change the services to be active/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('to.match', /select-services$/)

    cy.findByRole('link', { name: /Change the services to be inactive/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('to.match', /select-services$/)

    proceedToNextPage()

    cy.verifyLastAPICall(
      { method: 'PUT', urlPath: '/keyworker-api/prisons/LEI/policies' },
      {
        policies: [
          {
            policy: 'KEY_WORKER',
            enabled: true,
          },
          {
            policy: 'PERSONAL_OFFICER',
            enabled: false,
          },
        ],
      },
    )
  })

  const verifyPageContent = () => {
    cy.title().should('match', /Check your answers - Key workers - DPS/i)
    cy.findByRole('heading', { name: 'Check this information before saving these changes' }).should('be.visible')
    cy.findByRole('button', { name: 'Save' }).should('be.visible')
  }

  const proceedToNextPage = () => {
    cy.findByRole('button', { name: 'Save' }).click()
    cy.url().should('match', /\/confirmation$/)
  }

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

    cy.visit(`/key-worker/${journeyId}/select-services/check-answers`, { failOnStatusCode: false })
  }
})
