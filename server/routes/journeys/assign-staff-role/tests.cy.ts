import { v4 as uuidV4 } from 'uuid'

context('/assign-staff-role', () => {
  let journeyId = uuidV4()

  const getSearchInput = () => cy.findByRole('textbox', { name: 'Find a staff member' })
  const getSearchButton = () => cy.findByRole('button', { name: 'Search' })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
  })

  it('should search staff members', () => {
    navigateToTestPage()
    cy.url().should('match', /\/assign-staff-role$/)

    cy.title().should('equal', 'Make someone a key worker - Key worker - DPS')
    cy.findByRole('heading', { name: 'Make someone a key worker' }).should('be.visible')
    getSearchInput().should('be.visible')
    getSearchButton().should('be.visible')

    // verify validation error
    getSearchButton().click()
    cy.findByRole('link', { name: /Enter a name, work email address or username$/ })
      .should('be.visible')
      .click()
    getSearchInput().should('be.focused')

    cy.task('stubSearchStaff', [
      {
        staffId: 1001,
        firstName: 'Joe',
        lastName: 'Doe',
        email: 'joe.doe@email.com',
        username: 'JOE_DOE',
      },
    ])

    getSearchInput().type('Joe')
    getSearchButton().click()
    cy.findByRole('link', { name: 'Doe, Joe' })
      .should('be.visible')
      .and('have.attr', 'href')
      .should('match', /assign-staff-role\/select\?staffId=1001/)
    cy.contains('td', 'Doe, Joe').next().should('contain.text', 'joe.doe@email.com')
    cy.contains('td', 'Doe, Joe').next().next().should('contain.text', 'JOE_DOE')
  })

  it('should show no results when there is no match', () => {
    navigateToTestPage()
    cy.url().should('match', /\/assign-staff-role$/)

    cy.task('stubSearchStaff', [])
    getSearchInput().type('Joe')
    getSearchButton().click()

    cy.findByText('There are no results for this name or email address at Leeds (HMP)').should('be.visible')
  })

  const navigateToTestPage = () => {
    journeyId = uuidV4()
    cy.signIn({ failOnStatusCode: false })
    cy.visit(`/key-worker/${journeyId}/assign-staff-role`, {
      failOnStatusCode: false,
    })
  }
})
