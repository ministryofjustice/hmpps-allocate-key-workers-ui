import { v4 as uuidV4 } from 'uuid'

context('test errorHandler', () => {
  const uuid = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
  })

  it('should go to the custom error page when an API 500s', () => {
    cy.task('stubGetPrisoner500')
    cy.task('stubGetPrisonerImage')
    cy.signIn()
    cy.visit(`${uuid}/prisoners/A1111AA/referral/start`, { failOnStatusCode: false })
    cy.findByText(/sorry, there is a problem with the service/i).should('be.visible')
  })

  it('should say page not found when 404', () => {
    cy.signIn()
    cy.visit(`${uuid}/foobar`, { failOnStatusCode: false })
    cy.findByRole('heading', { name: /Page not found/i }).should('be.visible')
  })
})
