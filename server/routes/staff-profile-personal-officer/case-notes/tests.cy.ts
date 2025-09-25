import AuthorisedRoles from '../../../authentication/authorisedRoles'

context('Case notes', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn', {
      user_id: '488095',
      roles: [AuthorisedRoles.KW_MIGRATION],
      hasAllocationJobResponsibilities: false,
    })
    cy.task('stubEnabledPrison')
    cy.task('stubSearchAllocatableStaffStatusActive')
    cy.task('stubKeyworkerDetails')
    cy.task('stubSearchCaseNotes')
  })

  it('should show case notes', () => {
    navigateToTestPage()

    validatePageContents()

    validateSorting()

    validateLinks()
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visitWithHistory(`/personal-officer/staff-profile/488095/case-notes`, [
      '/personal-officer',
      '/personal-officer/manage',
      '/personal-officer/staff-profile/34353',
    ])
    cy.get('.case-note-details').eq(0).click()
    cy.get('.case-note-details').eq(1).click()
  }

  const validatePageContents = () => {
    cy.title().should('equal', 'Personal officer profile - Personal officers - DPS')
    cy.findByRole('heading', { name: /^AVAILABLE-ACTIVE KEY-WORKER$/i }).should('be.visible')

    cy.get('.govuk-breadcrumbs__list-item').eq(0).should('include.text', 'Digital Prison Services')
    cy.get('.govuk-breadcrumbs__list-item').eq(1).should('include.text', 'Personal officers')

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

  const validateLinks = () => {
    cy.get('h3.govuk-heading-m')
      .eq(0)
      .should('have.text', 'Key worker entry: Joe Doe (AA1111B)')
      .find('a')
      .should(
        'have.attr',
        'href',
        'http://localhost:3001/save-backlink?service=allocate-personal-officers&redirectPath=%2Fprisoner%2FAA1111B&returnPath=%2Fstaff-profile%2F488095%2Fcase-notes%3Fsort%3DoccurredAt%252CASC%26history%3DH4sIAAAAAAAAE4tW0i9ILSrOz0vM0c1PS8tMTi1S0sEU089NzEtMT8UqVVySmJamW1CUn5aZk6pvbGJsakyEOhMLCwNLU%252F3kxOJU3bz8ktRicvTYF%252BcXldjmJyeXFhWlpjiWqBo5OwY7K8UCABJPhQDWAAAA',
      )

    cy.get('h3.govuk-heading-m')
      .eq(1)
      .should('have.text', 'Key worker session: Joe Doe (AA1111B)')
      .find('a')
      .should(
        'have.attr',
        'href',
        'http://localhost:3001/save-backlink?service=allocate-personal-officers&redirectPath=%2Fprisoner%2FAA1111B&returnPath=%2Fstaff-profile%2F488095%2Fcase-notes%3Fsort%3DoccurredAt%252CASC%26history%3DH4sIAAAAAAAAE4tW0i9ILSrOz0vM0c1PS8tMTi1S0sEU089NzEtMT8UqVVySmJamW1CUn5aZk6pvbGJsakyEOhMLCwNLU%252F3kxOJU3bz8ktRicvTYF%252BcXldjmJyeXFhWlpjiWqBo5OwY7K8UCABJPhQDWAAAA',
      )
  }
})
