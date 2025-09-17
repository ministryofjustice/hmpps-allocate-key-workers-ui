import { v4 as uuidV4 } from 'uuid'
import { PartialJourneyData } from '../../../../../integration_tests/support/commands'

context('/update-capacity-status-and-working-pattern/update-status-inactive', () => {
  const journeyId = uuidV4()

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
    cy.url().should('match', /\/update-status-inactive/)

    verifyPageContent()

    proceedToNextPage()

    cy.verifyLastAPICall(
      { method: 'PUT', urlPath: '/keyworker-api/prisons/LEI/staff/488095' },
      {
        status: 'INACTIVE',
        reactivateOn: null,
        deactivateActiveAllocations: true,
      },
    )
  })

  const verifyPageContent = () => {
    cy.title().should('equal', 'Unavailable (inactive) - Key workers - DPS')
    cy.findByRole('heading', {
      name: 'Are you sure you want to change Available-Active Key-Worker’s status to Inactive?',
    }).should('be.visible')

    cy.findByRole('button', { name: 'Yes, save this change' }).should('be.visible')
    cy.findByRole('button', { name: 'No, return to key worker profile' })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /cancel/)
  }

  const proceedToNextPage = () => {
    cy.findByRole('button', { name: 'Yes, save this change' }).click()
    cy.url().should('match', /\/update-capacity-status-and-working-pattern\?/)
    cy.get('.govuk-notification-banner__heading')
      .should('be.visible')
      .and('contain.text', 'You have updated this key worker’s status to Inactive.')
  }

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(
      `/key-worker/${journeyId}/start-update-staff/488095?proceedTo=update-capacity-status-and-working-pattern`,
      {
        failOnStatusCode: false,
      },
    )

    cy.injectJourneyDataAndReload<PartialJourneyData>(journeyId, {
      updateStaffDetails: {
        status: {
          code: 'INACTIVE',
          description: 'Inactive',
        },
      },
    })

    cy.visit(`/key-worker/${journeyId}/update-capacity-status-and-working-pattern/update-status-inactive`)
  }
})
