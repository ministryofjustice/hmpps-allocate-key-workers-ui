import { verifyRoleBasedAccess } from '../../../integration_tests/support/roleBasedAccess'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'

context('/manage-roles', () => {
  const getAssignRadio = () => cy.findByRole('radio', { name: `Make someone a key worker` })
  const getRemoveRadio = () => cy.findByRole('radio', { name: `Remove the key worker role from someone` })
  const getContinueButton = () => cy.findByRole('button', { name: 'Continue' })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubEnabledPrison')
    cy.task('stubSignIn')
  })

  describe('Role based access', () => {
    verifyRoleBasedAccess('/key-worker/manage-roles', UserPermissionLevel.ALLOCATE)
  })

  it('should proceed to Assign staff role journey', () => {
    navigateToTestPage()
    cy.url().should('match', /\/manage-roles$/)

    verifyPageContent()
    verifyValidationErrors()

    getAssignRadio().click()
    getContinueButton().click()

    cy.url().should('match', /\/manage-roles\/assign$/)
  })

  it('should proceed to Remove staff role journey', () => {
    navigateToTestPage()
    cy.url().should('match', /\/manage-roles$/)

    verifyPageContent()
    verifyValidationErrors()

    getRemoveRadio().click()
    getContinueButton().click()

    cy.url().should('match', /\/manage-roles\/remove$/)
  })

  const verifyPageContent = () => {
    cy.title().should('equal', 'Add or remove key worker role - Key workers - DPS')
    cy.findByRole('heading', {
      name: 'Do you want to make someone a key worker or remove the role from someone?',
    }).should('be.visible')
    getAssignRadio().should('exist')
    getRemoveRadio().should('exist')
    getContinueButton().should('be.visible')
  }

  const verifyValidationErrors = () => {
    getContinueButton().click()

    cy.findByRole('link', { name: /Select if you want to assign or remove the key worker role$/i })
      .should('be.visible')
      .click()
    getAssignRadio().should('be.focused')
  }

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(`/key-worker/manage-roles`, { failOnStatusCode: false })
  }
})
