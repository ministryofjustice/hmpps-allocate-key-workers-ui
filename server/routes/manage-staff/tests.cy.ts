context('Manage key workers', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task('stubKeyworkerStatuses')
  })

  it('should handle invalid queries', () => {
    getAllKeyworkers()

    navigateToTestPage()

    cy.visit('/key-worker/manage-staff?query=<script>alert%28%27inject%27%29<%2Fscript>', {
      failOnStatusCode: false,
    })
    cy.get('#query').should('have.value', '')
    cy.get('.govuk-table__row').should('have.length', 7)

    cy.visit('/key-worker/manage-staff?status=<script>alert%28%27inject%27%29<%2Fscript>', {
      failOnStatusCode: false,
    })
    cy.get('#status').should('have.value', '')
    cy.get('.govuk-table__row').should('have.length', 7)
  })

  it('happy path', () => {
    getAllKeyworkers()

    navigateToTestPage()

    cy.title().should('equal', 'Manage key workers - Key workers - DPS')

    cy.get('.govuk-heading-l').should('contain.text', 'Manage key workers')
    cy.get('.govuk-heading-m').should('contain.text', 'Filter by')

    cy.get('.moj-pagination__results')
      .should('have.length', 2)
      .eq(0)
      .should('contain.text', 'Showing 1 to 6 of 6')
      .should('contain.text', 'results')
    cy.get('.moj-pagination__results')
      .eq(1)
      .should('contain.text', 'Showing 1 to 6 of 6')
      .should('contain.text', 'results')

    cy.get('#query').should('have.text', '')
    cy.get('#status').should('have.value', '')

    cy.findByRole('button', { name: 'Apply filters' })
    cy.findByRole('link', { name: 'Clear' })

    cy.get('.govuk-table__row').should('have.length', 7)
    cy.get('.govuk-table__row').eq(1).children().eq(0).should('contain.text', 'Key-Worker, Available-Active')
    cy.get('.govuk-table__row').eq(2).children().eq(0).should('contain.text', 'Key-Worker, Available-Active2')
    cy.get('.govuk-table__row').eq(3).children().eq(0).should('contain.text', 'Key-Worker, Unavailable-Annual-Leave')
    cy.get('.govuk-table__row').eq(4).children().eq(0).should('contain.text', 'Key-Worker, Unavailable-Inactive')
    cy.get('.govuk-table__row')
      .eq(5)
      .children()
      .eq(0)
      .should('contain.text', 'Key-Worker, Unavailable-Long-Term-Absence')
    cy.get('.govuk-table__row')
      .eq(6)
      .children()
      .eq(0)
      .should('contain.text', 'Key-Worker, Unavailable-No-Prisoner-Contact')

    cy.get('.govuk-table__row').eq(1).children().eq(1).should('contain.text', 'Active')
    cy.get('.govuk-table__row').eq(2).children().eq(1).should('contain.text', 'Active')
    cy.get('.govuk-table__row').eq(3).children().eq(1).should('contain.text', 'Unavailable - annual leave')
    cy.get('.govuk-table__row').eq(4).children().eq(1).should('contain.text', 'Inactive')
    cy.get('.govuk-table__row').eq(5).children().eq(1).should('contain.text', 'Unavailable - long term absence')
    cy.get('.govuk-table__row').eq(6).children().eq(1).should('contain.text', 'Unavailable - no prisoner contact')

    cy.get('.govuk-table__row').eq(1).children().eq(2).should('contain.text', '32')
    cy.get('.govuk-table__row').eq(2).children().eq(2).should('contain.text', '32')
    cy.get('.govuk-table__row').eq(3).children().eq(2).should('contain.text', '9')
    cy.get('.govuk-table__row').eq(4).children().eq(2).should('contain.text', '0')
    cy.get('.govuk-table__row').eq(5).children().eq(2).should('contain.text', '1')
    cy.get('.govuk-table__row').eq(6).children().eq(2).should('contain.text', '0')

    cy.get('.govuk-table__row').eq(1).children().eq(3).should('contain.text', '28')
    cy.get('.govuk-table__row').eq(2).children().eq(3).should('contain.text', '28')
    cy.get('.govuk-table__row').eq(3).children().eq(3).should('contain.text', '6')
    cy.get('.govuk-table__row').eq(4).children().eq(3).should('contain.text', '11')
    cy.get('.govuk-table__row').eq(5).children().eq(3).should('contain.text', '4')
    cy.get('.govuk-table__row').eq(6).children().eq(3).should('contain.text', '12')

    cy.get('.govuk-table__row').eq(1).children().eq(4).should('contain.text', 'Yes')
    cy.get('.govuk-table__row').eq(2).children().eq(4).should('contain.text', 'Yes')
    cy.get('.govuk-table__row').eq(3).children().eq(4).should('contain.text', 'Yes')
    cy.get('.govuk-table__row').eq(4).children().eq(4).should('contain.text', 'No')
    cy.get('.govuk-table__row').eq(5).children().eq(4).should('contain.text', 'No')
    cy.get('.govuk-table__row').eq(6).children().eq(4).should('contain.text', 'No')

    cy.get('.govuk-table__row').eq(1).children().eq(5).should('contain.text', '0')
    cy.get('.govuk-table__row').eq(2).children().eq(5).should('contain.text', '0')
    cy.get('.govuk-table__row').eq(3).children().eq(5).should('contain.text', '0')
    cy.get('.govuk-table__row').eq(4).children().eq(5).should('contain.text', '0')
    cy.get('.govuk-table__row').eq(5).children().eq(5).should('contain.text', '0')
    cy.get('.govuk-table__row').eq(6).children().eq(5).should('contain.text', '0')

    // Sort by allocated prisoners
    cy.get(':nth-child(2) > button').click()

    cy.get('.govuk-table__row').eq(1).children().eq(2).should('contain.text', '32')
    cy.get('.govuk-table__row').eq(2).children().eq(2).should('contain.text', '32')
    cy.get('.govuk-table__row').eq(3).children().eq(2).should('contain.text', '0')
    cy.get('.govuk-table__row').eq(4).children().eq(2).should('contain.text', '9')
    cy.get('.govuk-table__row').eq(5).children().eq(2).should('contain.text', '1')
    cy.get('.govuk-table__row').eq(6).children().eq(2).should('contain.text', '0')

    cy.task('stubSearchAllocatableStaff', [
      {
        staffId: 488095,
        firstName: 'AVAILABLE-ACTIVE',
        lastName: 'KEY-WORKER',
        status: {
          code: 'ACT',
          description: 'Active',
        },
        capacity: 28,
        allocated: 32,
        allowAutoAllocation: true,
        numberOfSessions: 0,
      },
    ])

    cy.get('#status').select('ACTIVE')
    cy.get('#query').type('AVAILABLE-ACTIVE')
    cy.findByRole('button', { name: 'Apply filters' }).click()

    cy.get('.moj-pagination__results')
      .eq(1)
      .should('contain.text', 'Showing 1 to 1 of 1')
      .should('contain.text', 'result')
    cy.get('.govuk-table__row').eq(1).children().eq(1).should('contain.text', 'Active')

    getAllKeyworkers()

    cy.findByRole('link', { name: 'Clear' }).click()

    cy.get('.govuk-table__row').should('have.length', 7)

    cy.task('stubSearchAllocatableStaff', [
      {
        staffId: 488099,
        firstName: 'UNAVAILABLE-INACTIVE',
        lastName: 'KEY-WORKER',
        status: {
          code: 'INA',
          description: 'Inactive',
        },
        capacity: 11,
        allocated: 0,
        allowAutoAllocation: false,
        numberOfSessions: 0,
      },
    ])

    cy.get('#query').should('have.text', '')
    cy.get('#status').select('INACTIVE')

    cy.findByRole('button', { name: 'Apply filters' }).click()

    cy.get('.moj-pagination__results')
      .eq(1)
      .should('contain.text', 'Showing 1 to 1 of 1')
      .should('contain.text', 'result')
    cy.get('.govuk-table__row').eq(1).children().eq(1).should('contain.text', 'Inactive')
  })

  it('handles API errors', () => {
    cy.task('stubSearchAllocatableStaffError')

    navigateToTestPage()

    cy.findByText('Sorry, there is a problem with the service').should('be.visible')
  })

  const getAllKeyworkers = () => {
    cy.task('stubSearchAllocatableStaff', [
      {
        staffId: 488095,
        firstName: 'AVAILABLE-ACTIVE',
        lastName: 'KEY-WORKER',
        status: {
          code: 'ACT',
          description: 'Active',
        },
        capacity: 28,
        allocated: 32,
        allowAutoAllocation: true,
        numberOfSessions: 0,
      },
      {
        staffId: 488096,
        firstName: 'AVAILABLE-ACTIVE2',
        lastName: 'KEY-WORKER',
        status: {
          code: 'ACT',
          description: 'Active',
        },
        capacity: 28,
        allocated: 32,
        allowAutoAllocation: true,
        numberOfSessions: 0,
      },
      {
        staffId: 488096,
        firstName: 'UNAVAILABLE-ANNUAL-LEAVE',
        lastName: 'KEY-WORKER',
        status: {
          code: 'UAL',
          description: 'Unavailable - annual leave',
        },
        capacity: 6,
        allocated: 9,
        allowAutoAllocation: true,
        numberOfSessions: 0,
      },
      {
        staffId: 488097,
        firstName: 'UNAVAILABLE-LONG-TERM-ABSENCE',
        lastName: 'KEY-WORKER',
        status: {
          code: 'ULT',
          description: 'Unavailable - long term absence',
        },
        capacity: 4,
        allocated: 1,
        allowAutoAllocation: false,
        numberOfSessions: 0,
      },
      {
        staffId: 488098,
        firstName: 'UNAVAILABLE-NO-PRISONER-CONTACT',
        lastName: 'KEY-WORKER',
        status: {
          code: 'UNP',
          description: 'Unavailable - no prisoner contact',
        },
        capacity: 12,
        allocated: 0,
        allowAutoAllocation: false,
        numberOfSessions: 0,
      },
      {
        staffId: 488099,
        firstName: 'UNAVAILABLE-INACTIVE',
        lastName: 'KEY-WORKER',
        status: {
          code: 'INA',
          description: 'Inactive',
        },
        capacity: 11,
        allocated: 0,
        allowAutoAllocation: false,
        numberOfSessions: 0,
      },
    ])
  }

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/key-worker/manage-staff', { failOnStatusCode: false })
  }
})
