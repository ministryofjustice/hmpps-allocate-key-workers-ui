import { verifyRoleBasedAccess } from '../../../integration_tests/support/roleBasedAccess'
import AuthorisedRoles from '../../authentication/authorisedRoles'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'
import { POLICIES } from '../../utils/constants'
import { getDateInReadableFormat } from '../../utils/datetimeUtils'

context('Key workers data', () => {
  before(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn', { roles: [AuthorisedRoles.KW_MIGRATION] })
    cy.task('stubEnabledPrison')
  })

  describe('Role based access', () => {
    verifyRoleBasedAccess('/key-worker/data', UserPermissionLevel.VIEW)
  })

  it('shows stats', () => {
    cy.task('stubEnabledPrisonWithHighComplexityNeedsPrisoners')
    cy.task('stubKeyworkerApiStats2025')
    cy.task('stubKeyworkerApiStats2024')

    navigateToTestPage()

    cy.title().should('equal', 'View key worker data - Key workers - DPS')
    cy.findByRole('heading', { name: /^Key worker data for Leeds \(HMP\)$/i }).should('be.visible')
    cy.findByText('Select a date range to view')

    cy.findByRole('textbox', { name: 'From' }).should('be.visible')
    cy.findByRole('textbox', { name: 'To' }).should('be.visible')
    cy.findByRole('button', { name: 'View' })

    cy.findByText(
      'Displaying statistics from 6 February 2025 to 28 February 2025. Comparing against statistics from 11 January 2025 to 11 January 2025.',
    )

    cy.findByText(`Date updated: ${getDateInReadableFormat(new Date().toISOString())}`)

    cy.get('.key-worker-data-stat-card')
      .eq(0)
      .within(() => {
        cy.get('h2').should('have.text', 'Number of recorded key worker sessions')
        cy.get('.govuk-heading-l').should('have.text', '1')
        cy.get('p').eq(1).should('have.text', '+1 increase')
        cy.get('span.stat-change--increase').should('have.text', '+1')
      })
    cy.get('.key-worker-data-stat-card')
      .eq(1)
      .within(() => {
        cy.get('h2').should('have.text', 'Number of recorded key worker entries')
        cy.get('.govuk-heading-l').should('have.text', '0')
        cy.get('p').eq(1).should('have.text', 'No change')
      })
    cy.get('.key-worker-data-stat-card')
      .eq(2)
      .within(() => {
        cy.get('h2').should('have.text', 'Total number of prisoners')
        cy.get('.govuk-heading-l').should('have.text', '1172')
        cy.get('p').eq(1).should('have.text', '+3 increase')
        cy.get('span.stat-change--increase').should('have.text', '+3')
      })
    cy.get('.key-worker-data-stat-card')
      .eq(3)
      .within(() => {
        cy.get('h2').should('have.text', 'Total number of high complexity prisoners')
        cy.get('.govuk-heading-l').should('have.text', '0')
        cy.get('p').eq(1).should('have.text', 'No change')
      })
    cy.get('.key-worker-data-stat-card')
      .eq(4)
      .within(() => {
        cy.get('h2').should('have.text', 'Percentage of prisoners with an allocated key worker')
        cy.get('.govuk-heading-l').should('have.text', '91.98 %')
        cy.get('p').eq(1).should('have.text', '-0.15 % decrease')
        cy.get('span.stat-change--decrease').should('have.text', '-0.15 %')
      })
    cy.get('.key-worker-data-stat-card')
      .eq(5)
      .within(() => {
        cy.get('h2').should('have.text', 'Total number of active key workers')
        cy.get('.govuk-heading-l').should('have.text', '11')
        cy.get('p').eq(1).should('have.text', '+3 increase')
      })
    cy.get('.key-worker-data-stat-card')
      .eq(6)
      .within(() => {
        cy.get('h2').should('have.text', 'Average time from reception to first key worker session')
        cy.get('.govuk-heading-l').should('have.text', '0 days')
        cy.get('p').eq(1).should('have.text', 'No change')
      })
    cy.get('.key-worker-data-stat-card')
      .eq(7)
      .within(() => {
        cy.get('h2').should('have.text', 'Average time from reception to key worker allocation')
        cy.get('.govuk-heading-l').should('have.text', '66 days')
        cy.get('p').eq(1).should('have.text', '+66 days increase')
      })
    cy.get('.key-worker-data-stat-card')
      .eq(8)
      .within(() => {
        cy.get('h2').should('have.text', 'Delivery rate against frequency of a session every week')
        cy.get('.govuk-heading-l').should('have.text', '0.03 %')
        cy.get('p').eq(1).should('have.text', '+0.03 % increase')
        cy.get('span.stat-change--increase').should('have.text', '+0.03 %')
      })
    cy.get('.key-worker-data-stat-card')
      .eq(9)
      .within(() => {
        cy.get('h2').should('have.text', 'Number of projected key worker sessions')
        cy.get('.govuk-heading-l').should('have.text', '3851')
        cy.get('p').eq(1).should('have.text', '+3684 increase')
        cy.get('span.stat-change--increase').should('have.text', '+3684')
      })

    verifyStatsChange()
    verifyErrorMessages()
  })

  it('hides case note sessions stat on personal officer', () => {
    cy.task('stubEnabledPrisonWithHighComplexityNeedsPrisoners')
    cy.task('stubKeyworkerApiStats2025')
    cy.task('stubKeyworkerApiStats2024')

    navigateToTestPage(POLICIES['personal-officer'].path)

    cy.get('.key-worker-data-stat-card').should('have.length', 9)

    cy.get('.key-worker-data-stat-card')
      .eq(0)
      .within(() => {
        cy.get('h2').should('have.text', 'Number of recorded personal officer entries')
        cy.get('.govuk-heading-l').should('have.text', '0')
        cy.get('p').eq(1).should('have.text', 'No change')
      })
    cy.get('.key-worker-data-stat-card')
      .eq(1)
      .within(() => {
        cy.get('h2').should('have.text', 'Total number of prisoners')
        cy.get('.govuk-heading-l').should('have.text', '1172')
        cy.get('p').eq(1).should('have.text', '+3 increase')
        cy.get('span.stat-change--increase').should('have.text', '+3')
      })
    cy.get('.key-worker-data-stat-card')
      .eq(2)
      .within(() => {
        cy.get('h2').should('have.text', 'Total number of high complexity prisoners')
        cy.get('.govuk-heading-l').should('have.text', '0')
        cy.get('p').eq(1).should('have.text', 'No change')
      })
    cy.get('.key-worker-data-stat-card')
      .eq(3)
      .within(() => {
        cy.get('h2').should('have.text', 'Percentage of prisoners with an allocated personal officer')
        cy.get('.govuk-heading-l').should('have.text', '91.98 %')
        cy.get('p').eq(1).should('have.text', '-0.15 % decrease')
        cy.get('span.stat-change--decrease').should('have.text', '-0.15 %')
      })
    cy.get('.key-worker-data-stat-card')
      .eq(4)
      .within(() => {
        cy.get('h2').should('have.text', 'Total number of active personal officers')
        cy.get('.govuk-heading-l').should('have.text', '11')
        cy.get('p').eq(1).should('have.text', '+3 increase')
      })
    cy.get('.key-worker-data-stat-card')
      .eq(5)
      .within(() => {
        cy.get('h2').should('have.text', 'Average time from reception to first personal officer session')
        cy.get('.govuk-heading-l').should('have.text', '0 days')
        cy.get('p').eq(1).should('have.text', 'No change')
      })
    cy.get('.key-worker-data-stat-card')
      .eq(6)
      .within(() => {
        cy.get('h2').should('have.text', 'Average time from reception to personal officer allocation')
        cy.get('.govuk-heading-l').should('have.text', '66 days')
        cy.get('p').eq(1).should('have.text', '+66 days increase')
      })
    cy.get('.key-worker-data-stat-card')
      .eq(7)
      .within(() => {
        cy.get('h2').should('have.text', 'Delivery rate against frequency of a session every week')
        cy.get('.govuk-heading-l').should('have.text', '0.03 %')
        cy.get('p').eq(1).should('have.text', '+0.03 % increase')
        cy.get('span.stat-change--increase').should('have.text', '+0.03 %')
      })
    cy.get('.key-worker-data-stat-card')
      .eq(8)
      .within(() => {
        cy.get('h2').should('have.text', 'Number of projected personal officer sessions')
        cy.get('.govuk-heading-l').should('have.text', '3851')
        cy.get('p').eq(1).should('have.text', '+3684 increase')
        cy.get('span.stat-change--increase').should('have.text', '+3684')
      })
  })

  it('shows "no data" message when there is no data', () => {
    cy.task('stubKeyworkerApiStatsNoData')

    navigateToTestPage()

    cy.findByRole('heading', { name: /^Key worker data for Leeds \(HMP\)$/i }).should('be.visible')

    cy.findByRole('textbox', { name: 'From' }).should('be.visible')
    cy.findByRole('textbox', { name: 'To' }).should('be.visible')
    cy.findByRole('button', { name: 'View' })

    cy.findByText('There is no data for this period.').should('be.visible')
  })

  const verifyStatsChange = () => {
    cy.findByRole('textbox', { name: /From/ }).clear().type('1/1/2024')
    cy.findByRole('textbox', { name: /To/ }).clear().type('31/1/2024')

    cy.findByRole('button', { name: /View/ }).click()

    cy.get('.key-worker-data-stat-card')
      .eq(0)
      .children()
      .eq(0)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Number of recorded key worker sessions')
      })
    cy.get('.key-worker-data-stats').eq(0).children().eq(0).should('have.text', '1')
    cy.get('.key-worker-data-stats').eq(0).children().eq(1).should('have.text', '+1 increase')
    cy.get('.key-worker-data-stats').eq(0).children().eq(1).find('span.stat-change--increase').should('have.text', '+1')

    cy.get('.key-worker-data-stat-card')
      .eq(1)
      .children()
      .eq(0)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Number of recorded key worker entries')
      })
    cy.get('.key-worker-data-stats').eq(1).children().eq(0).should('have.text', '0')
    cy.get('.key-worker-data-stats').eq(1).children().eq(1).should('have.text', 'No change')

    cy.get('.key-worker-data-stat-card')
      .eq(2)
      .children()
      .eq(0)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Total number of prisoners')
      })
    cy.get('.key-worker-data-stats').eq(2).children().eq(0).should('have.text', '1172')
    cy.get('.key-worker-data-stats').eq(2).children().eq(1).should('have.text', '+3 increase')
    cy.get('.key-worker-data-stats').eq(2).children().eq(1).find('span.stat-change--increase').should('have.text', '+3')

    cy.get('.key-worker-data-stat-card')
      .eq(4)
      .children()
      .eq(0)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Percentage of prisoners with an allocated key worker')
      })
    cy.get('.key-worker-data-stats').eq(4).children().eq(0).should('have.text', '91.98 %')
    cy.get('.key-worker-data-stats').eq(4).children().eq(1).should('have.text', '-0.15 % decrease')
    cy.get('.key-worker-data-stats')
      .eq(4)
      .children()
      .eq(1)
      .find('span.stat-change--decrease')
      .should('have.text', '-0.15 %')

    cy.get('.key-worker-data-stat-card')
      .eq(5)
      .children()
      .eq(0)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Total number of active key workers')
      })
    cy.get('.key-worker-data-stats').eq(5).children().eq(0).should('have.text', '11')
    cy.get('.key-worker-data-stats').eq(5).children().eq(1).should('have.text', '+3 increase')
    cy.get('.key-worker-data-stats').eq(5).children().eq(1).find('span.stat-change--increase').should('have.text', '+3')

    cy.get('.key-worker-data-stat-card')
      .eq(6)
      .children()
      .eq(0)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Average time from reception to first key worker session')
      })
    cy.get('.key-worker-data-stats').eq(6).children().eq(0).should('have.text', '0 days')
    cy.get('.key-worker-data-stats').eq(6).children().eq(1).should('have.text', 'No change')

    cy.get('.key-worker-data-stat-card')
      .eq(7)
      .children()
      .eq(0)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Average time from reception to key worker allocation')
      })
    cy.get('.key-worker-data-stats').eq(7).children().eq(0).should('have.text', '66 days')
    cy.get('.key-worker-data-stats').eq(7).children().eq(1).should('have.text', '+66 days increase')
    cy.get('.key-worker-data-stats')
      .eq(7)
      .children()
      .eq(1)
      .find('span.stat-change--increase')
      .should('have.text', '+66 days')

    cy.get('.key-worker-data-stat-card')
      .eq(8)
      .children()
      .eq(0)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Delivery rate against frequency of a session every week')
      })
    cy.get('.key-worker-data-stats').eq(8).children().eq(0).should('have.text', '0.03 %')
    cy.get('.key-worker-data-stats').eq(8).children().eq(1).should('have.text', '+0.03 % increase')
    cy.get('.key-worker-data-stats')
      .eq(8)
      .children()
      .eq(1)
      .find('span.stat-change--increase')
      .should('have.text', '+0.03 %')

    cy.get('.key-worker-data-stat-card')
      .eq(9)
      .children()
      .eq(0)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Number of projected key worker sessions')
      })
    cy.get('.key-worker-data-stats').eq(9).children().eq(0).should('have.text', '3851')
    cy.get('.key-worker-data-stats').eq(9).children().eq(1).should('have.text', '+3684 increase')
    cy.get('.key-worker-data-stats')
      .eq(9)
      .children()
      .eq(1)
      .find('span.stat-change--increase')
      .should('have.text', '+3684')
  }

  const verifyErrorMessages = () => {
    cy.findByRole('textbox', { name: /From/ }).clear().type('aa/bb/cccc')
    cy.findByRole('textbox', { name: /To/ }).clear().type('32/1/2025')

    cy.findByRole('button', { name: /View/ }).click()

    cy.findAllByText('From date must be a real date').should('have.length', 1)
    cy.findAllByText('To date must be a real date').should('have.length', 1)
  }

  const navigateToTestPage = (policyPath: string = 'key-worker') => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(`/${policyPath}/data`, { failOnStatusCode: false })
  }
})
