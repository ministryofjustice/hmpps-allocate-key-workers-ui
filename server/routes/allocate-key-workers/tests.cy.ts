context('Profile Info', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task('stubResidentialHierarchy')
    cy.task('stubSearchPrisonersWithQuery')
    cy.task('stubSearchPrisonersWithLocation')
    cy.task('stubSearchPrisoner')
    cy.task('stubKeyworkerMembersAll')
    cy.task('stubSearchPrisonersWithExcludeAllocations')
  })

  it('should load page correctly', () => {
    navigateToTestPage()

    checkPageContentsNoFilter()

    checkSorting()

    checkPrisonersExcludeActiveAllocationsFilter()

    checkNameOrPrisonNumberFilter()

    checkResidentialLocationFilter()
  })

  const checkPageContentsNoFilter = () => {
    cy.findByRole('heading', { name: /Allocate key workers to prisoners/i }).should('be.visible')
    cy.findByRole('heading', { name: /Filter by/i }).should('be.visible')
    cy.findByRole('button', { name: /Apply filters/i }).should('be.visible')
    cy.findByRole('link', { name: /Clear/i }).should('be.visible').should('have.attr', 'href', '?clear=true')

    cy.findByRole('textbox', { name: /Name or prison number/ }).should('exist')
    cy.findByRole('combobox', { name: /Residential location/ }).should('exist')

    cy.findByRole('checkbox', { name: /Prisoners without a key worker/ }).should('exist')

    cy.findByText('Select key workers from the dropdown lists or automatically assign them.').should('exist')
    cy.findByText('Keyworkers will only be allocated when you save your changes.').should('exist')

    cy.findByRole('button', { name: 'Assign key workers automatically' }).should('exist')

    cy.get('.moj-pagination').should('have.length', 2).eq(0).should('contain.text', 'Showing 1 to 3 of 3 results')

    cy.get('.govuk-table__row').should('have.length', 4)
    cy.get('.govuk-table__row')
      .eq(0)
      .children()
      .eq(0)
      .should('contain.text', 'Name and prisoner number')
      .children()
      .should('have.length', 1)
    cy.get('.govuk-table__row')
      .eq(0)
      .children()
      .eq(1)
      .should('contain.text', 'Residential location')
      .children()
      .should('have.length', 1)
    cy.get('.govuk-table__row')
      .eq(0)
      .children()
      .eq(2)
      .should('contain.text', 'Key worker')
      .children()
      .should('have.length', 1)
    cy.get('.govuk-table__row')
      .eq(0)
      .children()
      .eq(3)
      .should('contain.text', 'Change key worker')
      .children()
      .should('have.length', 0)
    cy.get('.govuk-table__row').eq(0).children().eq(4).should('contain.text', '').children().should('have.length', 0)

    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'Ayo, Zakira')
    cy.get('.govuk-table__row').eq(1).children().eq(1).should('contain.text', '1-1-035')
    cy.get('.govuk-table__row').eq(1).children().eq(2).should('contain.text', 'Rob Cooper')
    cy.get('.govuk-table__row')
      .eq(1)
      .children()
      .eq(3)
      .should('contain.text', 'Key-Worker, Available-Active (allocations: 32)')
    cy.get('.govuk-table__row')
      .eq(1)
      .children()
      .eq(4)
      .should('contain.text', 'View allocation history')
      .children()
      .eq(0)
      .should('have.attr', 'href', '/prisoner-allocation-history/A4288DZ')

    cy.findByRole('button', { name: 'Save changes' }).should('exist')
  }

  const checkPrisonersExcludeActiveAllocationsFilter = () => {
    cy.findByRole('checkbox', { name: /Prisoners without a key worker/ }).check()
    cy.findByRole('button', { name: /Apply filters/i }).click()

    cy.get('.moj-pagination').should('have.length', 2).eq(0).should('contain.text', 'Showing 1 to 2 of 2 results')

    cy.get('.govuk-table__row').should('have.length', 3)
    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'Bogisich, Astrid')
    cy.get('.govuk-table__row').eq(1).children().eq(1).should('contain.text', '3-1-027')
    cy.get('.govuk-table__row').eq(1).children().eq(2).should('contain.text', '-')
    cy.get('.govuk-table__row')
      .eq(1)
      .children()
      .eq(3)
      .should('contain.text', 'Key-Worker, Available-Active (allocations: 32)')
    cy.get('.govuk-table__row')
      .eq(1)
      .children()
      .eq(4)
      .should('contain.text', 'View allocation history')
      .children()
      .eq(0)
      .should('have.attr', 'href', '/prisoner-allocation-history/A2504EA')

    cy.get('.govuk-table__row').eq(2).children().eq(0).should('contain.text', 'Capodilupo, Darwin')
    cy.get('.govuk-table__row').eq(2).children().eq(1).should('contain.text', '4-2-031')
    cy.get('.govuk-table__row').eq(2).children().eq(2).should('contain.text', '-')
    cy.get('.govuk-table__row')
      .eq(2)
      .children()
      .eq(3)
      .should('contain.text', 'Key-Worker, Available-Active (allocations: 32)')
    cy.get('.govuk-table__row').eq(2).children().eq(4).should('not.contain.text', 'View allocation history')
  }

  const checkSorting = () => {
    cy.get('.govuk-table__row').eq(0).children().eq(2).should('contain.text', 'Key worker').click()

    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'Bogisich, Astrid')
    cy.get('.govuk-table__row').eq(2).children().eq(0).should('contain.text', 'Capodilupo, Darwin')
    cy.get('.govuk-table__row').eq(3).children().eq(0).should('contain.text', 'Ayo, Zakira')
  }

  const checkResidentialLocationFilter = () => {
    cy.findByRole('textbox', { name: /Name or prison number/ }).clear()
    cy.findByRole('combobox', { name: /Residential location/ }).select('3')
    cy.findByRole('button', { name: /Apply filters/i }).click()

    cy.get('.moj-pagination').should('have.length', 2).eq(0).should('contain.text', 'Showing 1 to 1 of 1 result')

    cy.get('.govuk-table__row').should('have.length', 2)
    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'Bogisich, Astrid')
  }

  const checkNameOrPrisonNumberFilter = () => {
    cy.findByRole('checkbox', { name: /Prisoners without a key worker/ }).uncheck()
    cy.findByRole('textbox', { name: /Name or prison number/ })
      .clear()
      .type('Ayo')
    cy.findByRole('button', { name: /Apply filters/i }).click()

    cy.get('.moj-pagination').should('have.length', 2).eq(0).should('contain.text', 'Showing 1 to 1 of 1 result')

    cy.get('.govuk-table__row').should('have.length', 2)
    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'Ayo, Zakira')
  }

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/allocate-key-workers', { failOnStatusCode: false })
  }
})
