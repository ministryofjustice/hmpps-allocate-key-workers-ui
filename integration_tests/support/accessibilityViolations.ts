import { Result, Spec } from 'axe-core'
import { fail } from 'assert'

const logAccessibilityViolations = (violations: Result[]) => {
  cy.task('logAccessibilityViolationsSummary', `Accessibility violations detected: ${violations.length}`)

  const violationData = violations.map(violation => ({
    ...violation,
    nodes: violation.nodes.length,
    nodeTargets: violation.nodes.map(node => node.target).join(' - '),
  }))

  cy.task('logAccessibilityViolationsTable', violationData)
}

export const checkAxeAccessibility = () => {
  cy.injectAxe()
  cy.configureAxe({
    rules: [
      // Temporary rule whilst this issue is resolved https://github.com/w3c/aria/issues/1404
      { id: 'aria-allowed-attr', reviewOnFail: true },
      // Ignore the "All page content should be contained by landmarks", which conflicts with GOV.UK guidance (https://design-system.service.gov.uk/components/back-link/#how-it-works)
      { id: 'region', reviewOnFail: true, selector: '.govuk-back-link' },
      { id: 'empty-table-header', reviewOnFail: true },
      // Allow MOJ Pagination components to have duplicate aria label (when used in pair on top and bottom of a table)
      { id: 'landmark-unique', reviewOnFail: true, selector: '.moj-pagination' },
      { id: 'color-contrast', reviewOnFail: true, selector: '.stat-change--decrease' },
    ],
  } as Spec)
  cy.checkA11y(undefined, undefined, logAccessibilityViolations)

  checkStyleRules()
}

const checkStyleRules = () => {
  // No un-curly apostrophes in text
  cy.contains('*', `'`)
    .should('have.length.gte', 0)
    .each(element => {
      if (element.hasClass('govuk-summary-list__value') || element.hasClass('govuk-inset-text')) {
        return
      }
      const textExcludeTesname = element.text().replace(/Tes'name/gi, '')
      if (textExcludeTesname.includes("'")) {
        fail(`Non-curly apostrophe found in the following text: ${element.text()}`)
      }
    })
}

export default {
  logAccessibilityViolationsSummary: (message: string): null => {
    // eslint-disable-next-line no-console
    console.log(message)

    return null
  },
  logAccessibilityViolationsTable: (violations: Result[]): null => {
    // eslint-disable-next-line no-console
    console.table(violations)

    return null
  },
}
