import { v4 as uuidV4 } from 'uuid'
import { createMock } from '../../../../testutils/mockObjects'
import { defaultKeyworkerDetails } from '../../../../../integration_tests/mockApis/keyworkerApi'

context('/update-capacity-status-and-working-pattern/cancel', () => {
  const journeyId = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task(
      'stubKeyworkerDetailsWithoutStats',
      createMock(defaultKeyworkerDetails, { status: { code: 'INACTIVE', description: 'Inactive' } }),
    )
    cy.task('stubKeyworkerStatuses')
  })

  it('should cancel to /update-capacity-status-and-working-pattern page', () => {
    cy.signIn({ failOnStatusCode: false })

    cy.navigateWithHistory(
      `/key-worker/${journeyId}/start-update-staff/488095?proceedTo=update-capacity-status-and-working-pattern`,
      ['/key-worker'],
    )
    cy.navigateWithHistory(`/key-worker/${journeyId}/update-capacity-status-and-working-pattern/cancel`, [
      '/key-worker',
    ])

    cy.url().should('match', /\/update-capacity-status-and-working-pattern/)
  })
})
