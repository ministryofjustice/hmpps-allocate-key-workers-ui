import { v4 as uuidV4 } from 'uuid'

context('/update-capacity-status/cancel', () => {
  const journeyId = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task('stubKeyworkerDetails', { status: { code: 'INACTIVE', description: 'Inactive' } })
    cy.task('stubKeyworkerStatuses')
  })

  it('should cancel to /update-capacity-status page', () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(`/key-worker/${journeyId}/start-update-key-worker/488095?proceedTo=update-capacity-status`, {
      failOnStatusCode: false,
    })

    cy.visit(`/key-worker/${journeyId}/update-capacity-status/cancel`)

    cy.url().should('match', /\/update-capacity-status$/)
  })
})
