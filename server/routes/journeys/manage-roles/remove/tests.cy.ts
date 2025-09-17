import { v4 as uuidV4 } from 'uuid'
import { verifyRoleBasedAccess } from '../../../../../integration_tests/support/roleBasedAccess'
import { UserPermissionLevel } from '../../../../interfaces/hmppsUser'

context('/manage-roles/remove', () => {
  const journeyId = uuidV4()
  const PAGE_URL = `/key-worker/${journeyId}/manage-roles/remove`

  const getSearchInput = () => cy.findByRole('textbox', { name: 'Find a staff member' })
  const getSearchButton = () => cy.findByRole('button', { name: 'Search' })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
  })

  describe('Role based access', () => {
    verifyRoleBasedAccess(PAGE_URL, UserPermissionLevel.ALLOCATE)
  })

  it('should search staff members', () => {
    navigateToTestPage()
    cy.url().should('match', /\/manage-roles\/remove/)

    cy.title().should('equal', 'Search for staff member - Key workers - DPS')
    cy.findByRole('heading', { name: 'Remove the key worker role from someone' }).should('be.visible')
    cy.findByRole('link', { name: 'Digital Prison Services' })
      .should('be.visible')
      .and('have.attr', 'href', 'http://localhost:3001')
    cy.findByRole('link', { name: /^Key workers/ })
      .should('be.visible')
      .and('have.attr', 'href')
      .should('match', /\/key-worker/)

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
      .should('match', /remove\/select\?staffId=1001/)
    cy.contains('td', 'Doe, Joe').next().should('contain.text', 'joe.doe@email.com')
    cy.contains('td', 'Doe, Joe').next().next().should('contain.text', 'JOE_DOE')
  })

  it('should show no results when there is no match', () => {
    navigateToTestPage()
    cy.url().should('match', /\/manage-roles\/remove/)

    cy.task('stubSearchStaff', [])
    getSearchInput().type('Joe')
    getSearchButton().click()

    cy.findByText('There are no results for this name or email address at Leeds (HMP)').should('be.visible')
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visitWithHistory(`/key-worker/${journeyId}/manage-roles/remove`, [
      '/key-worker',
      '/key-worker/manage-roles',
      '/key-worker/manage-roles/assign',
    ])
  }
})
