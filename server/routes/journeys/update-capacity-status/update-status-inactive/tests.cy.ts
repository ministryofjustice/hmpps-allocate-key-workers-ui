import { v4 as uuidV4 } from 'uuid'
import { PartialJourneyData } from '../../../../../integration_tests/support/commands'

context('/update-capacity-status/update-status-inactive', () => {
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
    cy.url().should('match', /\/update-status-inactive$/)

    verifyPageContent()

    proceedToNextPage()
  })

  const verifyPageContent = () => {
    cy.title().should('equal', 'Change this key worker’s status to Inactive - Key worker profile - DPS')
    cy.findByRole('heading', { name: 'Available-Active Key-Worker' }).should('be.visible')
    cy.get('.status-tag').eq(0).should('have.text', 'Active')

    cy.findByRole('heading', { name: 'Are you sure you want to change this key worker’s status to Inactive?' }).should(
      'be.visible',
    )

    cy.findByRole('button', { name: 'Yes, save this change' }).should('be.visible')
    cy.findByRole('button', { name: 'No, return to key worker profile' })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /cancel$/)
  }

  const proceedToNextPage = () => {
    cy.findByRole('button', { name: 'Yes, save this change' }).click()
    cy.url().should('match', /\/update-capacity-status$/)
    cy.get('.govuk-notification-banner__heading')
      .should('be.visible')
      .and('contain.text', 'You have updated this key worker’s status and capacity.')
  }

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(`/key-worker/${journeyId}/start-update-key-worker/488095?proceedTo=update-capacity-status`, {
      failOnStatusCode: false,
    })

    cy.injectJourneyDataAndReload<PartialJourneyData>(journeyId, {
      updateCapacityStatus: {
        status: {
          code: 'INACTIVE',
          description: 'Inactive',
        },
        capacity: 999,
      },
    })

    cy.visit(`/key-worker/${journeyId}/update-capacity-status/update-status-inactive`)
  }
})
