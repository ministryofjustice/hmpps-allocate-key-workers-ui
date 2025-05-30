import { formatDateConcise, getDateInReadableFormat } from '../../utils/datetimeUtils'
import { getComparisonDates } from '../../utils/testUtils'

context('Key workers data', () => {
  before(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
  })

  it('shows stats', () => {
    cy.task('stubEnabledPrisonWithHighComplexityNeedsPrisoners')
    cy.task('stubKeyworkerApiStats2025')
    cy.task('stubKeyworkerApiStats2024')

    navigateToTestPage()

    cy.findByRole('heading', { name: /^Key workers data for Leeds \(HMP\)$/i }).should('be.visible')
    cy.findByText('Select a date range to view')

    cy.findByRole('textbox', { name: 'From' }).should('be.visible')
    cy.findByRole('textbox', { name: 'To' }).should('be.visible')
    cy.findByRole('button', { name: 'View' })

    cy.findByText(
      `Displaying statistics from ${dateFrom} to ${dateTo}. Comparing against statistics from ${comparisonDateFrom} to ${comparisonDateTo}.`,
    )

    cy.findByText(`Date updated: ${getDateInReadableFormat(new Date().toISOString())}`)

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
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/key-workers-data', { failOnStatusCode: false })
  }
})

const getDateAsIsoString = () => {
  const lastDay = new Date()
  lastDay.setDate(lastDay.getDate() - 1)

  const firstDay = new Date(lastDay.getFullYear(), lastDay.getMonth() - 1, lastDay.getDate() + 1)

  return { start: firstDay.toISOString().substring(0, 10), end: lastDay.toISOString().substring(0, 10) }
}

const newSpan = getDateAsIsoString()
const previousSpan = getComparisonDates(newSpan.start, newSpan.end)
const dateFrom = getDateInReadableFormat(newSpan.start)!
const dateTo = getDateInReadableFormat(newSpan.end)!
export const comparisonDateFrom = getDateInReadableFormat(formatDateConcise(previousSpan.start)!)
export const comparisonDateTo = getDateInReadableFormat(formatDateConcise(previousSpan.end)!)
