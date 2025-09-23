context('test /accessibility-statement', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
  })

  describe('Role based access', () => {
    it(`should allow access to users with no permission level`, () => {
      cy.task('stubSignIn', { roles: [], hasAllocationJobResponsibilities: false })
      cy.signIn({ failOnStatusCode: false })
      cy.visit(`accessibility-statement`, { failOnStatusCode: false })
      cy.url().should('to.match', /\/accessibility-statement$/)
    })
  })

  it('tests page', () => {
    cy.signIn()
    cy.visit(`accessibility-statement`)
    cy.url().should('to.match', /\/accessibility-statement$/)
    cy.findByRole('heading', { name: 'Accessibility statement' }).should('be.visible')
    cy.findByRole('link', { name: 'Back' }).should('have.attr', 'href').and('match', /#/)
  })
})
