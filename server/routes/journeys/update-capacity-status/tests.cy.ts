import { v4 as uuidV4 } from 'uuid'
import { createMock } from '../../../testutils/mockObjects'
import { defaultKeyworkerDetails } from '../../../../integration_tests/mockApis/keyworkerApi'

context('Update capacity and status', () => {
  const journeyId = uuidV4()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task(
      'stubKeyworkerDetails',
      createMock(defaultKeyworkerDetails, { status: { code: 'INACTIVE', description: 'Inactive' } }),
    )
    cy.task('stubKeyworkerStatuses')
    cy.task('stubUpsertStaffDetails')
  })

  it('should show initial data', () => {
    navigateToTestPage()
    cy.url().should('match', /\/update-capacity-status$/)

    cy.get('.govuk-heading-l').eq(0).should('have.text', 'Available-Active Key-Worker')
    cy.get('.status-tag').eq(0).should('have.text', 'Inactive')

    cy.get('.govuk-heading-s').eq(0).should('have.text', 'Establishment')
    cy.get('p').eq(1).should('have.text', 'Leeds')
    cy.get('.govuk-heading-s').eq(1).should('have.text', 'Schedule type')
    cy.get('p').eq(2).should('have.text', 'Full Time')
    cy.get('.govuk-heading-s').eq(2).should('have.text', 'Prisoners allocated')
    cy.get('p').eq(3).should('have.text', '1')
    cy.findByRole('textbox', { name: 'Maximum capacity' }).should('be.visible').and('have.value', '6')
    cy.findByRole('combobox', { name: 'Status' }).should('be.visible').and('have.value', 'INACTIVE')
  })

  it("should update the keyworker's details", () => {
    navigateToTestPage()

    cy.get('.govuk-notification-banner__heading').should('not.exist')

    cy.get('#capacity').clear().type('8')
    cy.get('#capacity').should('have.value', '8')
    cy.get('#status').select('ACTIVE')
    cy.get('#status').should('have.value', 'ACTIVE')
    cy.findByRole('button', { name: /Save and continue/i }).click()

    cy.get('.govuk-notification-banner__heading')
      .should('be.visible')
      .and('contain.text', 'You have updated this key worker’s status and capacity.')
  })

  it('should proceed to update-status-inactive', () => {
    navigateToTestPage()
    cy.get('#status').select('INACTIVE')
    cy.findByRole('button', { name: /Save and continue/i }).click()

    cy.url().should('match', /\/update-status-inactive$/)
  })

  it('should reject an invalid number and show a message', () => {
    navigateToTestPage()

    cy.get('.govuk-error-summary').should('not.exist')

    cy.get('#capacity').clear().type('1001')
    cy.get('#capacity').should('have.value', '1001')
    cy.findByRole('button', { name: /Save and continue/i }).click()
    cy.get('.govuk-error-summary').should('exist')
    cy.get('ul.govuk-error-summary__list a').should('have.text', 'Enter a maximum capacity between 1 and 999')

    cy.get('#capacity').clear().type('0')
    cy.findByRole('button', { name: /Save and continue/i }).click()
    cy.get('.govuk-error-summary').should('exist')
    cy.get('ul.govuk-error-summary__list a').should('have.text', 'Enter a maximum capacity between 1 and 999')
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(`/key-worker/${journeyId}/start-update-staff/488095?proceedTo=update-capacity-status`, {
      failOnStatusCode: false,
    })
  }
})
