import { v4 as uuidV4 } from 'uuid'
import { PartialJourneyData } from '../../../../../../integration_tests/support/commands'
import AuthorisedRoles from '../../../../../authentication/authorisedRoles'

context('/manage-roles/assign/role', () => {
  const yesRadio = () => cy.findByRole('radio', { name: 'Yes' })
  const noRadio = () => cy.findByRole('radio', { name: 'No' })
  const continueButton = () => cy.findByRole('button', { name: 'Continue' })

  const journeyId = uuidV4()
  const PAGE_URL = `/key-worker/${journeyId}/manage-roles/assign/role`

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
  })

  describe('Role based access', () => {
    it('should deny access to a user with only policy job access', () => {
      cy.verifyRoleBasedAccess({ userRoles: [], hasJobResponsibility: true, url: PAGE_URL })
    })

    it('should deny access to a user with view only access', () => {
      cy.verifyRoleBasedAccess({
        userRoles: [AuthorisedRoles.KEYWORKER_MONITOR, AuthorisedRoles.PERSONAL_OFFICER_VIEW],
        url: PAGE_URL,
      })
    })
  })

  it('should try all cases proceeding to next page', () => {
    navigateToTestPage()
    cy.url().should('match', /\/assign\/role$/)

    verifyPageContent()

    verifyValidationErrors()

    proceedToNextPage()

    verifyInputValuesArePersisted()
  })

  it('should proceed to Not Prison Officer error page', () => {
    navigateToTestPage()
    cy.url().should('match', /\/assign\/role$/)

    noRadio().click()
    continueButton().click()

    cy.url().should('match', /\/assign\/not-prison-officer$/)
  })

  const verifyPageContent = () => {
    cy.title().should('equal', 'Are they a prison officer - Key workers - DPS')

    cy.findByRole('heading', {
      name: 'Is this person a prison officer?',
    }).should('be.visible')

    yesRadio().should('exist')
    noRadio().should('exist')
    continueButton().should('be.visible')

    cy.findByRole('link', { name: 'Back' })
      .should('be.visible')
      .and('have.attr', 'href')
      .and('match', /assign$/)
  }

  const verifyValidationErrors = () => {
    continueButton().click()
    cy.findByRole('link', { name: /Select if this individual is a prison officer$/i })
      .should('be.visible')
      .click()
    yesRadio().should('be.focused')
  }

  const proceedToNextPage = () => {
    yesRadio().click()
    continueButton().click()
    cy.url().should('match', /\/working-pattern$/)
  }

  const verifyInputValuesArePersisted = () => {
    cy.go('back')
    yesRadio().should('be.checked')
    noRadio().should('not.be.checked')
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
      },
    })

    cy.visit(PAGE_URL)
  }
})
