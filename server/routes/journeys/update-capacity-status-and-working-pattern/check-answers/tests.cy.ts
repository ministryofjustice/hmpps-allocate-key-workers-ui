import { v4 as uuidV4 } from 'uuid'
import { PartialJourneyData } from '../../../../../integration_tests/support/commands'

context('/update-capacity-status-and-working-pattern/check-answers', () => {
  let journeyId = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task('stubKeyworkerDetails')
    cy.task('stubKeyworkerStatuses')
    cy.task('stubUpsertStaffDetails')
  })

  it('should try ACTIVE scenario', () => {
    navigateToTestPage({
      updateStaffDetails: {
        status: {
          code: 'ACTIVE',
          description: 'Active',
        },
      },
    })
    cy.url().should('match', /\/check-answers$/)

    verifyPageCommonContent()

    cy.contains('dt', 'New status').next().should('include.text', 'Active')

    cy.findByRole('link', { name: /Change the new status/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('to.match', /update-status$/)

    proceedToNextPage('Active')
  })

  it('should try UNAVAILABLE_LONG_TERM_ABSENCE scenario', () => {
    navigateToTestPage({
      updateStaffDetails: {
        status: {
          code: 'UNAVAILABLE_LONG_TERM_ABSENCE',
          description: 'Unavailable (long-term absence)',
        },
        deactivateActiveAllocations: false,
      },
    })
    cy.url().should('match', /\/check-answers$/)

    verifyPageCommonContent()

    cy.contains('dt', 'New status').next().should('include.text', 'Unavailable (long-term absence)')
    cy.contains('dt', 'Deallocate current prisoners?').next().should('include.text', 'No')

    cy.findByRole('link', { name: /Change the new status/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('to.match', /update-status$/)

    cy.findByRole('link', { name: /Change whether to deallocate current prisoners/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('to.match', /update-status-unavailable$/)

    proceedToNextPage('Unavailable (long-term absence)')
  })

  it('should try UNAVAILABLE_ANNUAL_LEAVE scenario', () => {
    navigateToTestPage({
      updateStaffDetails: {
        status: {
          code: 'UNAVAILABLE_ANNUAL_LEAVE',
          description: 'Unavailable (annual leave)',
        },
        deactivateActiveAllocations: true,
        reactivateOn: '2070-09-05T00:00:00.000Z',
      },
    })
    cy.url().should('match', /\/check-answers$/)

    verifyPageCommonContent()

    cy.contains('dt', 'New status').next().should('include.text', 'Unavailable (annual leave)')
    cy.contains('dt', 'Return date').next().should('include.text', '5/9/2070')
    cy.contains('dt', 'Deallocate current prisoners?').next().should('include.text', 'Yes')

    cy.findByRole('link', { name: /Change the new status/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('to.match', /update-status$/)

    cy.findByRole('link', { name: /Change the return date/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('to.match', /update-status-annual-leave-return$/)

    cy.findByRole('link', { name: /Change whether to deallocate current prisoners/i })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('to.match', /update-status-unavailable$/)

    proceedToNextPage('Unavailable (annual leave)')
  })

  const verifyPageCommonContent = () => {
    cy.title().should('equal', 'Check your answers - Key workers - DPS')

    cy.findByRole('heading', { name: 'Check your answers' }).should('be.visible')
    cy.findByRole('button', { name: 'Confirm and submit' }).should('be.visible')
  }

  const proceedToNextPage = (statusDescription: string) => {
    cy.findByRole('button', { name: 'Confirm and submit' }).click()
    cy.url().should('match', /\/update-capacity-status-and-working-pattern$/)
    cy.get('.govuk-notification-banner__heading')
      .should('be.visible')
      .and('contain.text', `You have updated this key worker’s status to ${statusDescription}.`)
  }

  const navigateToTestPage = (journeyData: PartialJourneyData) => {
    journeyId = uuidV4()

    cy.signIn({ failOnStatusCode: false })
    cy.visit(
      `/key-worker/${journeyId}/start-update-staff/488095?proceedTo=update-capacity-status-and-working-pattern`,
      {
        failOnStatusCode: false,
      },
    )

    cy.injectJourneyDataAndReload<PartialJourneyData>(journeyId, journeyData)

    cy.visit(`/key-worker/${journeyId}/update-capacity-status-and-working-pattern/check-answers`)
  }
})
