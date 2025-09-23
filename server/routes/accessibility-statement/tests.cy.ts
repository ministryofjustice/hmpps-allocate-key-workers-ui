context('test /accessibility-statement', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
  })

  it('tests page', () => {
    cy.signIn()
    cy.visit(`accessibility-statement`)
    cy.url().should('to.match', /\/accessibility-statement$/)
    cy.findByRole('heading', { name: 'Accessibility statement' }).should('be.visible')
    cy.findByRole('link', { name: 'Back' }).should('have.attr', 'href').and('match', /#/)
  })
})
