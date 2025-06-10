context('Prisoner Allocation History', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task('stubGetPrisonerImage')
    cy.task('stubGetPrisonerDetails')
    cy.task('stubGetPrisonerDetailsMDI')
    cy.task('stubPrisonerAllocations')
  })

  it('redirects to "not found" page if user does not have the correct role', () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/key-worker/prisoner-allocation-history/A9965EB?query=&location=&excludeActiveAllocations=true', {
      failOnStatusCode: false,
    })

    cy.findByText('Page not found')
  })

  it('adds back query params on the back link', () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/key-worker/prisoner-allocation-history/A9965EA?query=&location=&excludeActiveAllocations=true', {
      failOnStatusCode: false,
    })

    cy.findByRole('link', { name: /back/i }).should(
      'have.attr',
      'href',
      '/key-worker/allocate-key-workers?query=&location=&excludeActiveAllocations=true',
    )
  })

  it('happy path', () => {
    navigateToTestPage()

    cy.findByRole('link', { name: /back/i }).should('have.attr', 'href', '/key-worker/allocate-key-workers')

    cy.get('.govuk-link--no-visited-state').eq(0).should('have.text', 'Cat, Tabby')
    cy.findByText('A9965EA')
    cy.get('.govuk-\\!-font-weight-bold').eq(1).should('have.text', 'Location')
    cy.findByText('2-1-005')

    cy.get('.govuk-heading-l').eq(0).should('have.text', 'Prisoner key worker allocation history')
    cy.get('.govuk-heading-s').eq(0).should('have.text', 'Current and previous allocations: 2')

    // Current key worker card
    cy.get('.govuk-summary-card__title')
      .eq(0)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Current key worker: Sample Keyworker')
      })

    cy.get('.govuk-summary-list__key')
      .eq(0)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Establishment')
      })
    cy.get('.govuk-summary-list__value')
      .eq(0)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Moorland (HMP & YOI)')
      })

    cy.get('.govuk-summary-list__key')
      .eq(1)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Allocated on')
      })
    cy.get('.govuk-summary-list__value')
      .eq(1)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('17/04/2025 14:41')
      })

    cy.get('.govuk-summary-list__key')
      .eq(2)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Allocation type')
      })
    cy.get('.govuk-summary-list__value')
      .eq(2)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Automatic')
      })

    cy.get('.govuk-summary-list__key')
      .eq(3)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Allocated by')
      })
    cy.get('.govuk-summary-list__value')
      .eq(3)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Test Keyworker')
      })

    cy.get('.govuk-summary-list__key')
      .eq(4)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Deallocated on')
      })
    cy.get('.govuk-summary-list__value')
      .eq(4)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('-')
      })

    cy.get('.govuk-summary-list__key')
      .eq(5)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Deallocated by')
      })
    cy.get('.govuk-summary-list__value')
      .eq(5)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('-')
      })

    cy.get('.govuk-summary-list__key')
      .eq(6)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Deallocation reason')
      })
    cy.get('.govuk-summary-list__value')
      .eq(6)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('-')
      })

    // Previous key worker card
    cy.get('.govuk-summary-card__title')
      .eq(1)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Previous key worker: Smith Last-Name')
      })

    cy.get('.govuk-summary-list__key')
      .eq(7)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Establishment')
      })
    cy.get('.govuk-summary-list__value')
      .eq(7)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Moorland (HMP & YOI)')
      })

    cy.get('.govuk-summary-list__key')
      .eq(8)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Allocated on')
      })
    cy.get('.govuk-summary-list__value')
      .eq(8)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('18/12/2024 10:56')
      })

    cy.get('.govuk-summary-list__key')
      .eq(9)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Allocation type')
      })
    cy.get('.govuk-summary-list__value')
      .eq(9)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Manual')
      })

    cy.get('.govuk-summary-list__key')
      .eq(10)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Allocated by')
      })
    cy.get('.govuk-summary-list__value')
      .eq(10)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Foo Baz')
      })

    cy.get('.govuk-summary-list__key')
      .eq(11)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Deallocated on')
      })
    cy.get('.govuk-summary-list__value')
      .eq(11)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('12/02/2025 15:57')
      })

    cy.get('.govuk-summary-list__key')
      .eq(12)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Deallocated by')
      })
    cy.get('.govuk-summary-list__value')
      .eq(12)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Fake Doe')
      })

    cy.get('.govuk-summary-list__key')
      .eq(13)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Deallocation reason')
      })
    cy.get('.govuk-summary-list__value')
      .eq(13)
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Manual')
      })
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/key-worker/prisoner-allocation-history/A9965EA', { failOnStatusCode: false })
  }
})
