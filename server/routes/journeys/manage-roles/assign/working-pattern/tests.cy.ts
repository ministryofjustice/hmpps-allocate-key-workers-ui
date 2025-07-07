import { v4 as uuidV4 } from 'uuid'
import { PartialJourneyData } from '../../../../../../integration_tests/support/commands'
import AuthorisedRoles from '../../../../../authentication/authorisedRoles'

context('/manage-roles/assign/working-pattern', () => {
  const fullTimeRadio = () => cy.findByRole('radio', { name: 'Full-time' })
  const partTimeRadio = () => cy.findByRole('radio', { name: 'Part-time' })
  const continueButton = () => cy.findByRole('button', { name: 'Continue' })

  const journeyId = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
  })

  describe('Role based access', () => {
    it('should deny access to a user with only policy job access', () => {
      cy.task('stubSignIn', {
        roles: [],
        hasAllocationJobResponsibilities: true,
      })

      navigateToTestPage()

      cy.url().should('to.match', /\/key-worker\/not-authorised/)
    })

    it('should deny access to a user with view only access', () => {
      cy.task('stubSignIn', {
        roles: [AuthorisedRoles.KEYWORKER_MONITOR, AuthorisedRoles.PERSONAL_OFFICER_VIEW],
      })

      navigateToTestPage()

      cy.url().should('to.match', /\/key-worker\/not-authorised/)
    })
  })

  it('should try all cases', () => {
    navigateToTestPage()
    cy.url().should('match', /\/assign\/working-pattern$/)

    verifyPageContent()

    verifyValidationErrors()

    proceedToNextPage()

    verifyInputValuesArePersisted()
  })

  const verifyPageContent = () => {
    cy.title().should('equal', 'Working pattern - Key workers - DPS')

    cy.findByRole('heading', {
      name: 'What is this prison officer’s working pattern?',
    }).should('be.visible')

    fullTimeRadio().should('exist')
    partTimeRadio().should('exist')
    continueButton().should('be.visible')

    cy.findByRole('link', { name: 'Back' }).should('be.visible').and('have.attr', 'href').and('match', /role$/)
  }

  const verifyValidationErrors = () => {
    continueButton().click()
    cy.findByRole('link', { name: /Select a working pattern$/i })
      .should('be.visible')
      .click()
    fullTimeRadio().should('be.focused')
  }

  const proceedToNextPage = () => {
    fullTimeRadio().click()
    continueButton().click()
    cy.url().should('match', /\/capacity$/)
  }

  const verifyInputValuesArePersisted = () => {
    cy.go('back')
    fullTimeRadio().should('be.checked')
    partTimeRadio().should('not.be.checked')
  }

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(`/key-worker/${journeyId}/manage-roles/assign`, {
      failOnStatusCode: false,
    })

    cy.injectJourneyDataAndReload<PartialJourneyData>(journeyId, {
      assignStaffRole: {
        staff: {
          staffId: 1001,
          username: 'STAFFNAME',
          firstName: 'Joe',
          lastName: 'Doe',
        },
        isPrisonOfficer: true,
      },
    })

    cy.visit(`/key-worker/${journeyId}/manage-roles/assign/working-pattern`)
  }
})
