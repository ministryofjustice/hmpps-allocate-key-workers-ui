context('Case notes', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task('stubSearchAllocatableStaffStatusActive')
    cy.task('stubKeyworkerDetails')
    cy.task('stubSearchCaseNotes')
  })

  it('should show case notes', () => {
    navigateToTestPage()

    validatePageContents()

    validateSorting()
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(
      `/key-worker/staff-profile/488095/case-notes?history=WyIva2V5LXdvcmtlciIsIi9rZXktd29ya2VyL21hbmFnZSIsIi9rZXktd29ya2VyL3N0YWZmLXByb2ZpbGUvMzQzNTMiXQ%3D%3D`,
      {
        failOnStatusCode: false,
      },
    )
  }

  const validatePageContents = () => {
    cy.title().should('equal', 'Key worker profile - Key workers - DPS')
    cy.findByRole('heading', { name: /^AVAILABLE-ACTIVE KEY-WORKER$/i }).should('be.visible')

    cy.get('.govuk-breadcrumbs__list-item').eq(0).should('include.text', 'Digital Prison Services')
    cy.get('.govuk-breadcrumbs__list-item').eq(1).should('include.text', 'Key worker')
    cy.get('.govuk-breadcrumbs__list-item').eq(2).should('include.text', 'Manage key workers')

    cy.get('.status-tag').eq(0).should('have.text', 'Active')

    cy.findByText('Session info').should('be.visible')
    cy.findByText('Entry info').should('be.visible')
    cy.findByText('additional info').should('be.visible')
  }

  const validateSorting = () => {
    cy.get('h3.govuk-heading-m').eq(0).should('have.text', 'Key worker entry: Joe Doe (AA1111B)')
    cy.get('h3.govuk-heading-m').eq(1).should('have.text', 'Key worker session: Joe Doe (AA1111B)')

    cy.findByRole('combobox', { name: 'Sort by' }).select('Created (oldest)')

    cy.get('h3.govuk-heading-m').eq(0).should('have.text', 'Key worker session: Joe Doe (AA1111B)')
    cy.get('h3.govuk-heading-m').eq(1).should('have.text', 'Key worker entry: Joe Doe (AA1111B)')
  }
})
