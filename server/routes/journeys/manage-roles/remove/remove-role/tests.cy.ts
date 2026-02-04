import { v4 as uuidV4 } from 'uuid'
import { PartialJourneyData } from '../../../../../../integration_tests/support/commands'
import { checkAxeAccessibility } from '../../../../../../integration_tests/support/accessibilityViolations'

context('/manage-roles/remove/remove-role', () => {
  let journeyId = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task('stubDeleteStaffDetails')
  })

  it('should try all cases for key worker', () => {
    navigateToTestPage()
    cy.url().should('match', /\/remove-role/)

    verifyPageContent()
    cy.findByText(
      'This prison officer will no longer be a key worker and their 12 allocated prisoners will be deallocated. You will need to make them a key worker again to be able to assign prisoners to them in future.',
    ).should('be.visible')

    proceedToNextPage()

    cy.verifyLastAPICall(
      { method: 'PUT', urlPath: '/keyworker-api/prisons/LEI/staff/1001' },
      {
        staffRole: null,
      },
    )
  })

  it('should skip content about deallocating prisoners if the staff has no assigned prisoner', () => {
    navigateToTestPage('key-worker', 0)
    cy.url().should('match', /\/remove-role/)

    verifyPageContent()

    cy.findByText(
      'This prison officer will no longer be a key worker. You will need to make them a key worker again to be able to assign prisoners to them in future.',
    ).should('be.visible')
  })

  const verifyPageContent = () => {
    cy.title().should('equal', 'Remove role - Key workers - DPS')

    cy.findByRole('heading', { name: 'Are you sure you want to remove the key worker role from Doe, Joe?' }).should(
      'be.visible',
    )

    cy.findByRole('button', { name: 'Yes, remove the role' }).should('be.visible')
    cy.findByRole('button', { name: 'No, return to homepage' })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /\/key-worker\?/)
  }

  const proceedToNextPage = () => {
    cy.findByRole('button', { name: 'Yes, remove the role' }).click()
    cy.url().should('match', /\/confirmation/)
  }

  const navigateToTestPage = (policyPath: string = 'key-worker', allocated: number = 12) => {
    journeyId = uuidV4()
    cy.signIn({ failOnStatusCode: false })
    cy.visit(`/${policyPath}/${journeyId}/manage-roles/remove`, {
      failOnStatusCode: false,
    })

    cy.injectJourneyDataAndReload<PartialJourneyData>(journeyId, {
      removeStaffRole: {
        staff: {
          staffId: 1001,
          username: 'STAFFNAME',
          firstName: 'Joe',
          lastName: 'Doe',
          allocated,
          staffRole: {
            position: { code: 'PRO', description: 'Prison officer' },
            scheduleType: { code: 'FT', description: 'Full-time' },
            hoursPerWeek: 35,
            fromDate: '2010-01-12',
          },
        },
      },
    })

    cy.visit(`/${policyPath}/${journeyId}/manage-roles/remove/remove-role`)
    checkAxeAccessibility()
  }
})
