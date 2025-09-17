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
    cy.visitWithHistory(`/key-worker/staff-profile/488095/case-notes`, [
      '/key-worker',
      '/key-worker/manage',
      '/key-worker/staff-profile/34353',
    ])

    cy.get('.case-note-details').eq(0).click()
    cy.get('.case-note-details').eq(1).click()
  }

  const validatePageContents = () => {
    cy.title().should('equal', 'Key worker profile - Key workers - DPS')
    cy.findByRole('heading', { name: /^AVAILABLE-ACTIVE KEY-WORKER$/i }).should('be.visible')

    cy.get('.govuk-breadcrumbs__list-item').eq(0).should('include.text', 'Digital Prison Services')
    cy.get('.govuk-breadcrumbs__list-item').eq(1).should('include.text', 'Key worker')
    cy.get('.govuk-breadcrumbs__list-item').eq(2).should('include.text', 'Manage key workers')

    cy.get('.status-tag').eq(0).should('have.text', 'Active')

    cy.findAllByText('Session info').eq(1).should('be.visible')
    cy.findAllByText('Entry info').eq(1).should('be.visible')
    cy.findAllByText('additional info').eq(0).should('be.visible')
  }

  const validateSorting = () => {
    cy.get('h3.govuk-heading-m').eq(0).should('have.text', 'Key worker session: Joe Doe (AA1111B)')
    cy.get('h3.govuk-heading-m').eq(1).should('have.text', 'Key worker entry: Joe Doe (AA1111B)')

    cy.findByRole('combobox', { name: 'Sort by' }).select('Happened (oldest)')

    cy.get('h3.govuk-heading-m').eq(0).should('have.text', 'Key worker entry: Joe Doe (AA1111B)')
    cy.get('h3.govuk-heading-m').eq(1).should('have.text', 'Key worker session: Joe Doe (AA1111B)')
  }
})
