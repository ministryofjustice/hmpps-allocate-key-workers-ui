import { comparisonDateFrom, comparisonDateTo, dateFrom, dateTo } from '../../utils/testUtils'

context('Key worker statistics', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrisonWithHighComplexityNeedsPrisoners')
  })

  it('shows stats', () => {
    cy.task('stubKeyworkerApiStats2025')
    cy.task('stubKeyworkerApiStats2024')

    navigateToTestPage()

    cy.findByRole('heading', { name: /^Key worker statistics for Leeds \(HMP\)$/i }).should('be.visible')

    cy.findByText('These statistics do not include people with a high complexity of need level.')
    cy.findByText('Prisoners in Leeds (HMP) have a key worker session every 1 week.')

    cy.findByRole('textbox', { name: 'From' }).should('be.visible')
    cy.findByRole('textbox', { name: 'To' }).should('be.visible')

    cy.findByText('Prisoner to key worker ratio')
    cy.findByText('6:1')

    cy.findByRole('button', { name: 'View' })

    cy.findByText(
      `Displaying statistics from ${dateFrom} to ${dateTo}. Comparing against statistics from ${comparisonDateFrom} to ${comparisonDateTo}.`,
    )

    cy.get('.govuk-grid-column-one-quarter')
      .eq(0)
      .children()
      .eq(0)
      .should('have.text', 'Total number of active key workers')
    cy.get('.govuk-grid-column-one-quarter').eq(0).children().eq(1).should('have.text', '11')
    cy.get('.govuk-grid-column-one-quarter').eq(0).children().eq(2).should('have.text', '+3 increase')

    cy.get('.govuk-grid-column-one-quarter')
      .eq(1)
      .children()
      .eq(0)
      .should('have.text', 'Percentage of prisoners with an allocated key worker')
    cy.get('.govuk-grid-column-one-quarter').eq(1).children().eq(1).should('have.text', '91.98 %')
    cy.get('.govuk-grid-column-one-quarter').eq(1).children().eq(2).should('have.text', '-0.15 % decrease')

    cy.get('.govuk-grid-column-one-quarter')
      .eq(2)
      .children()
      .eq(0)
      .should('have.text', 'Average time from reception to key worker allocation')
    cy.get('.govuk-grid-column-one-quarter').eq(2).children().eq(1).should('have.text', '66 days')
    cy.get('.govuk-grid-column-one-quarter').eq(2).children().eq(2).should('have.text', '+66 days increase')

    cy.get('.govuk-grid-column-one-quarter')
      .eq(3)
      .children()
      .eq(0)
      .should('have.text', 'Average time from reception to first key worker session')
    cy.get('.govuk-grid-column-one-quarter').eq(3).children().eq(1).should('have.text', '0 days')
    cy.get('.govuk-grid-column-one-quarter').eq(3).children().eq(2).should('have.text', 'No change')

    cy.get('.govuk-grid-column-one-quarter')
      .eq(4)
      .children()
      .eq(0)
      .should('have.text', 'Number of projected key worker sessions')
    cy.get('.govuk-grid-column-one-quarter').eq(4).children().eq(1).should('have.text', '3851')
    cy.get('.govuk-grid-column-one-quarter').eq(4).children().eq(2).should('have.text', '+3684 increase')

    cy.get('.govuk-grid-column-one-quarter')
      .eq(5)
      .children()
      .eq(0)
      .should('have.text', 'Number of recorded key worker sessions')
    cy.get('.govuk-grid-column-one-quarter').eq(5).children().eq(1).should('have.text', '1')
    cy.get('.govuk-grid-column-one-quarter').eq(5).children().eq(2).should('have.text', '+1 increase')

    cy.get('.govuk-grid-column-one-quarter').eq(6).children().eq(0).should('have.text', 'Compliance rate')
    cy.get('.govuk-grid-column-one-quarter').eq(6).children().eq(1).should('have.text', '0.03 %')
    cy.get('.govuk-grid-column-one-quarter').eq(6).children().eq(2).should('have.text', '+0.03 % increase')

    verifyStatsChange()
    verifyErrorMessages()
  })

  const verifyStatsChange = () => {
    cy.findByRole('textbox', { name: /From/ }).clear().type('1/1/2024')
    cy.findByRole('textbox', { name: /To/ }).clear().type('31/1/2024')

    cy.findByRole('button', { name: /View/ }).click()

    cy.get('.govuk-grid-column-one-quarter')
      .eq(0)
      .children()
      .eq(0)
      .should('have.text', 'Total number of active key workers')
    cy.get('.govuk-grid-column-one-quarter').eq(0).children().eq(1).should('have.text', '11')
    cy.get('.govuk-grid-column-one-quarter').eq(0).children().eq(2).should('have.text', '+3 increase')

    cy.get('.govuk-grid-column-one-quarter')
      .eq(1)
      .children()
      .eq(0)
      .should('have.text', 'Percentage of prisoners with an allocated key worker')
    cy.get('.govuk-grid-column-one-quarter').eq(1).children().eq(1).should('have.text', '91.98 %')
    cy.get('.govuk-grid-column-one-quarter').eq(1).children().eq(2).should('have.text', '-0.15 % decrease')

    cy.get('.govuk-grid-column-one-quarter')
      .eq(2)
      .children()
      .eq(0)
      .should('have.text', 'Average time from reception to key worker allocation')
    cy.get('.govuk-grid-column-one-quarter').eq(2).children().eq(1).should('have.text', '66 days')
    cy.get('.govuk-grid-column-one-quarter').eq(2).children().eq(2).should('have.text', '+66 days increase')

    cy.get('.govuk-grid-column-one-quarter')
      .eq(3)
      .children()
      .eq(0)
      .should('have.text', 'Average time from reception to first key worker session')
    cy.get('.govuk-grid-column-one-quarter').eq(3).children().eq(1).should('have.text', '0 days')
    cy.get('.govuk-grid-column-one-quarter').eq(3).children().eq(2).should('have.text', 'No change')

    cy.get('.govuk-grid-column-one-quarter')
      .eq(4)
      .children()
      .eq(0)
      .should('have.text', 'Number of projected key worker sessions')
    cy.get('.govuk-grid-column-one-quarter').eq(4).children().eq(1).should('have.text', '3851')
    cy.get('.govuk-grid-column-one-quarter').eq(4).children().eq(2).should('have.text', '+3684 increase')

    cy.get('.govuk-grid-column-one-quarter')
      .eq(5)
      .children()
      .eq(0)
      .should('have.text', 'Number of recorded key worker sessions')
    cy.get('.govuk-grid-column-one-quarter').eq(5).children().eq(1).should('have.text', '1')
    cy.get('.govuk-grid-column-one-quarter').eq(5).children().eq(2).should('have.text', '+1 increase')

    cy.get('.govuk-grid-column-one-quarter').eq(6).children().eq(0).should('have.text', 'Compliance rate')
    cy.get('.govuk-grid-column-one-quarter').eq(6).children().eq(1).should('have.text', '0.03 %')
    cy.get('.govuk-grid-column-one-quarter').eq(6).children().eq(2).should('have.text', '+0.03 % increase')

    cy.findByText(
      'Displaying statistics from 1 January 2024 to 31 January 2024. Comparing against statistics from 2 December 2023 to 31 December 2023.',
    )
  }

  const verifyErrorMessages = () => {
    cy.findByRole('textbox', { name: /From/ }).clear().type('aa/bb/cccc')
    cy.findByRole('textbox', { name: /To/ }).clear().type('32/1/2025')

    cy.findByRole('button', { name: /View/ }).click()

    cy.findAllByText('From date must be a real date').should('have.length', 2)
    cy.findAllByText('To date must be a real date').should('have.length', 2)
  }

  it('shows "no data" message when there is no data', () => {
    cy.task('stubKeyworkerApiStatsNoData')

    navigateToTestPage()

    cy.findByRole('heading', { name: /^Key worker statistics for Leeds \(HMP\)$/i }).should('be.visible')

    cy.findByText('These statistics do not include people with a high complexity of need level.')
    cy.findByText('Prisoners in Leeds (HMP) have a key worker session every 1 week.')

    cy.findByRole('textbox', { name: 'From' }).should('be.visible')
    cy.findByRole('textbox', { name: 'To' }).should('be.visible')

    cy.findByText('Prisoner to key worker ratio')
    cy.findByText('6:1')

    cy.findByRole('button', { name: 'View' })

    cy.findByText('There is no data for this period.').should('be.visible')
  })

  it('should show "-" when previous data values are null', () => {
    cy.task('stubKeyWorkerStatsWithNullPreviousValues')

    navigateToTestPage()

    cy.contains(
      `Displaying statistics from ${dateFrom} to ${dateTo}. Comparing against statistics from ${comparisonDateFrom} to ${comparisonDateTo}.`,
    )

    cy.get('.govuk-grid-column-one-quarter')
      .eq(1)
      .children()
      .eq(0)
      .should('have.text', 'Percentage of prisoners with an allocated key worker')
    cy.get('.govuk-grid-column-one-quarter').eq(1).children().eq(1).should('have.text', '-')
    cy.get('.govuk-grid-column-one-quarter').eq(1).children().eq(2).should('have.text', 'No change')

    cy.get('.govuk-grid-column-one-quarter')
      .eq(2)
      .children()
      .eq(0)
      .should('have.text', 'Average time from reception to key worker allocation')
    cy.get('.govuk-grid-column-one-quarter').eq(2).children().eq(1).should('have.text', '-')
    cy.get('.govuk-grid-column-one-quarter').eq(2).children().eq(2).should('have.text', 'No change')

    cy.get('.govuk-grid-column-one-quarter')
      .eq(3)
      .children()
      .eq(0)
      .should('have.text', 'Average time from reception to first key worker session')
    cy.get('.govuk-grid-column-one-quarter').eq(3).children().eq(1).should('have.text', '-')
    cy.get('.govuk-grid-column-one-quarter').eq(3).children().eq(2).should('have.text', 'No change')
  })

  it('should not should not show change values when previous data is null', () => {
    cy.task('stubKeyWorkerStatsWithNullPreviousData')

    navigateToTestPage()

    cy.findByText(`Displaying statistics from ${dateFrom} to ${dateTo}.`)

    cy.get('.govuk-grid-column-one-quarter')
      .eq(0)
      .children()
      .eq(0)
      .should('have.text', 'Total number of active key workers')
    cy.get('.govuk-grid-column-one-quarter').eq(0).children().eq(1).should('have.text', '11')

    cy.get('.govuk-grid-column-one-quarter')
      .eq(1)
      .children()
      .eq(0)
      .should('have.text', 'Percentage of prisoners with an allocated key worker')
    cy.get('.govuk-grid-column-one-quarter').eq(1).children().eq(1).should('have.text', '-')

    cy.get('.govuk-grid-column-one-quarter')
      .eq(2)
      .children()
      .eq(0)
      .should('have.text', 'Average time from reception to key worker allocation')
    cy.get('.govuk-grid-column-one-quarter').eq(2).children().eq(1).should('have.text', '-')

    cy.get('.govuk-grid-column-one-quarter')
      .eq(3)
      .children()
      .eq(0)
      .should('have.text', 'Average time from reception to first key worker session')
    cy.get('.govuk-grid-column-one-quarter').eq(3).children().eq(1).should('have.text', '-')

    cy.get('.govuk-grid-column-one-quarter')
      .eq(4)
      .children()
      .eq(0)
      .should('have.text', 'Number of projected key worker sessions')
    cy.get('.govuk-grid-column-one-quarter').eq(4).children().eq(1).should('have.text', '3851')

    cy.get('.govuk-grid-column-one-quarter')
      .eq(5)
      .children()
      .eq(0)
      .should('have.text', 'Number of recorded key worker sessions')
    cy.get('.govuk-grid-column-one-quarter').eq(5).children().eq(1).should('have.text', '1')

    cy.get('.govuk-grid-column-one-quarter').eq(6).children().eq(0).should('have.text', 'Compliance rate')
    cy.get('.govuk-grid-column-one-quarter').eq(6).children().eq(1).should('have.text', '0.03 %')
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/key-worker/staff-statistics', { failOnStatusCode: false })
  }
})
