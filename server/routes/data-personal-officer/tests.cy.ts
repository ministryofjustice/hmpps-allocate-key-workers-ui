import AuthorisedRoles from '../../authentication/authorisedRoles'

context('Personal officer data', () => {
  before(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubEnabledPrison')
    cy.task('stubSignIn', {
      roles: [AuthorisedRoles.KW_MIGRATION],
    })
  })

  it('show stats - personal officer - high complexity', () => {
    cy.task('stubEnabledPrisonWithHighComplexityNeedsPrisoners')
    cy.task('stubKeyworkerApiStats2025')
    cy.task('stubKeyworkerApiStats2024')

    navigateToTestPage()

    cy.get('.key-worker-data-stat-card').should('have.length', 7)

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
        cy.get('h2').should('have.text', 'Average time from eligibility to first personal officer entry')
        cy.get('.govuk-heading-l').should('have.text', '0 days')
        cy.get('p').eq(1).should('have.text', 'No change')
      })
    cy.get('.key-worker-data-stat-card')
      .eq(6)
      .within(() => {
        cy.get('h2').should('have.text', 'Average time from eligibility to personal officer allocation')
        cy.get('.govuk-heading-l').should('have.text', '66 days')
        cy.get('p').eq(1).should('have.text', '+66 days increase')
      })
  })

  it('show stats - personal officer - no high complexity', () => {
    cy.task('stubEnabledPrison')
    cy.task('stubKeyworkerApiStats2025')
    cy.task('stubKeyworkerApiStats2024')

    navigateToTestPage()

    cy.get('.key-worker-data-stat-card').should('have.length', 6)

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
        cy.get('h2').should('have.text', 'Percentage of prisoners with an allocated personal officer')
        cy.get('.govuk-heading-l').should('have.text', '91.98 %')
        cy.get('p').eq(1).should('have.text', '-0.15 % decrease')
        cy.get('span.stat-change--decrease').should('have.text', '-0.15 %')
      })
    cy.get('.key-worker-data-stat-card')
      .eq(3)
      .within(() => {
        cy.get('h2').should('have.text', 'Total number of active personal officers')
        cy.get('.govuk-heading-l').should('have.text', '11')
        cy.get('p').eq(1).should('have.text', '+3 increase')
      })
    cy.get('.key-worker-data-stat-card')
      .eq(4)
      .within(() => {
        cy.get('h2').should('have.text', 'Average time from reception to first personal officer entry')
        cy.get('.govuk-heading-l').should('have.text', '0 days')
        cy.get('p').eq(1).should('have.text', 'No change')
      })
    cy.get('.key-worker-data-stat-card')
      .eq(5)
      .within(() => {
        cy.get('h2').should('have.text', 'Average time from reception to personal officer allocation')
        cy.get('.govuk-heading-l').should('have.text', '66 days')
        cy.get('p').eq(1).should('have.text', '+66 days increase')
      })
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(`/personal-officer/data`, { failOnStatusCode: false })
  }
})
