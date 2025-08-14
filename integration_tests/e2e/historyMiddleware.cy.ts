const historyToBase64 = (history: string[], urlEncode: boolean = false) => {
  const base64 = Buffer.from(JSON.stringify(history)).toString('base64')
  return urlEncode ? encodeURIComponent(base64) : base64
}

context('historyMiddleware', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task('stubSearchAllocatableStaffStatusActive')
    cy.task('stubResidentialHierarchy')
    cy.task('stubSearchPrisoner')
    cy.task('stubSearchAllocatableStaffAll')
    cy.task('stubSearchPrisonersWithExcludeAllocations')
    cy.task('stubPrisonerAllocations')
    cy.task('stubGetPrisonerDetails', 'A2504EA')
    cy.task('stubAllocationRecommendations', {
      allocations: [
        {
          personIdentifier: 'A2504EA',
          location: 'COURT',
          staff: {
            staffId: 488095,
            firstName: 'UNAVAILABLE',
            lastName: 'ANNUAL-LEAVE',
            status: { code: 'UNA', description: 'Unavailable - annual leave' },
            capacity: 1,
            allocated: 1,
            allowAutoAllocation: true,
          },
        },
      ],
      noAvailableStaffFor: [{ personIdentifier: 'A2504EA', location: 'COURT' }],
      staff: [
        {
          staffId: 488096,
          firstName: 'AVAILABLE',
          lastName: 'ACTIVE',
          status: { code: 'ACT', description: 'Active' },
          capacity: 1,
          allocated: 0,
          allowAutoAllocation: true,
        },
      ],
    })
    cy.task('stubKeyworkerStatuses')
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
        stats: { recordedComplianceEvents: 0, complianceRate: 1.2345 },
        staffRole: {
          scheduleType: {
            code: 'FT',
            description: 'Full Time',
          },
        },
      },
    ])

    cy.task('stubKeyworkerDetails')
  })

  it('should show correct breadcrumbs when prisoner-allocation-history accessed from allocate route', () => {
    const searchBtn = () => cy.findByRole('button', { name: /Search/i })
    const excludeActiveCheckbox = () => cy.findByRole('checkbox', { name: /Prisoners without a key worker/ })

    cy.signIn({ failOnStatusCode: false })
    cy.visit('/key-worker')

    cy.findByRole('link', { name: /Allocate key workers to prisoners/i }).click()

    excludeActiveCheckbox().check()
    searchBtn().click()

    cy.findByRole('link', { name: /View allocation history/i }).click()

    cy.get('.govuk-breadcrumbs__link').should('have.length', 3)
    cy.get('.govuk-breadcrumbs__link')
      .eq(0)
      .should('include.text', 'Digital Prison Services')
      .and('have.attr', 'href')
      .should('equal', 'http://localhost:3001')
    cy.get('.govuk-breadcrumbs__link')
      .eq(1)
      .should('include.text', 'Key worker')
      .and('have.attr', 'href')
      .should('equal', `/key-worker?history=${historyToBase64(['/key-worker'], true)}`)
    cy.get('.govuk-breadcrumbs__link')
      .eq(2)
      .should('include.text', 'Allocate key workers')
      .and('have.attr', 'href')
      .should(
        'equal',
        `/key-worker/allocate?query=&cellLocationPrefix=&excludeActiveAllocations=true&history=${historyToBase64(['/key-worker', '/key-worker/allocate?query=&cellLocationPrefix=&excludeActiveAllocations=true'], true)}`,
      )
  })

  it('should show correct breadcrumbs when prisoner-allocation-history accessed from recommend allocate route', () => {
    const searchBtn = () => cy.findByRole('button', { name: /Search/i })
    const excludeActiveCheckbox = () => cy.findByRole('checkbox', { name: /Prisoners without a key worker/ })
    const autoAllocateButton = () => cy.findByRole('button', { name: /Assign key workers automatically/i })

    cy.signIn({ failOnStatusCode: false })
    cy.visit('/key-worker')

    cy.findByRole('link', { name: /Allocate key workers to prisoners/i }).click()

    excludeActiveCheckbox().check()
    searchBtn().click()

    autoAllocateButton().click()

    cy.get('.govuk-breadcrumbs__link').should('have.length', 3)
    cy.get('.govuk-breadcrumbs__link')
      .eq(0)
      .should('include.text', 'Digital Prison Services')
      .and('have.attr', 'href')
      .should('equal', 'http://localhost:3001')
    cy.get('.govuk-breadcrumbs__link')
      .eq(1)
      .should('include.text', 'Key worker')
      .and('have.attr', 'href')
      .should('equal', `/key-worker?history=${historyToBase64(['/key-worker'], true)}`)
    cy.get('.govuk-breadcrumbs__link')
      .eq(2)
      .should('include.text', 'Allocate key workers')
      .and('have.attr', 'href')
      .should(
        'equal',
        `/key-worker/allocate?query=&cellLocationPrefix=&excludeActiveAllocations=true&history=${historyToBase64(['/key-worker', '/key-worker/allocate?query=&cellLocationPrefix=&excludeActiveAllocations=true'], true)}`,
      )

    cy.findByRole('button', { name: 'Continue' }).click()

    cy.findByRole('link', { name: /View allocation history/i }).click()

    cy.get('.govuk-breadcrumbs__link').should('have.length', 4)
    cy.get('.govuk-breadcrumbs__link')
      .eq(0)
      .should('include.text', 'Digital Prison Services')
      .and('have.attr', 'href')
      .should('equal', 'http://localhost:3001')
    cy.get('.govuk-breadcrumbs__link')
      .eq(1)
      .should('include.text', 'Key worker')
      .and('have.attr', 'href')
      .should('equal', `/key-worker?history=${historyToBase64(['/key-worker'], true)}`)
    cy.get('.govuk-breadcrumbs__link')
      .eq(2)
      .should('include.text', 'Allocate key workers')
      .and('have.attr', 'href')
      .should(
        'equal',
        `/key-worker/allocate?query=&cellLocationPrefix=&excludeActiveAllocations=true&history=${historyToBase64(['/key-worker', '/key-worker/allocate?query=&cellLocationPrefix=&excludeActiveAllocations=true'], true)}`,
      )
    cy.get('.govuk-breadcrumbs__link')
      .eq(3)
      .should('include.text', 'Recommend allocations')
      .and('have.attr', 'href')
      .should(
        'equal',
        `/key-worker/recommend-allocations?allowPartialAllocation=true&history=${historyToBase64(['/key-worker', '/key-worker/allocate?query=&cellLocationPrefix=&excludeActiveAllocations=true', '/key-worker/recommend-allocations?allowPartialAllocation=true'], true)}`,
      )
  })

  it('should show correct breadcrumbs when prisoner-allocation-history accessed from staff-profile route', () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/key-worker')

    cy.findByRole('link', { name: /Manage key workers/i }).click()

    cy.get('select').eq(0).select('Active')
    cy.findByRole('button', { name: /Apply filters/i }).click()

    cy.findByRole('link', { name: /Key-Worker, Available-Active$/i }).click()

    cy.get('.govuk-breadcrumbs__link').should('have.length', 3)
    cy.get('.govuk-breadcrumbs__link')
      .eq(0)
      .should('include.text', 'Digital Prison Services')
      .and('have.attr', 'href')
      .should('equal', 'http://localhost:3001')
    cy.get('.govuk-breadcrumbs__link')
      .eq(1)
      .should('include.text', 'Key worker')
      .and('have.attr', 'href')
      .should('equal', `/key-worker?history=${historyToBase64(['/key-worker'], true)}`)
    cy.get('.govuk-breadcrumbs__link')
      .eq(2)
      .should('include.text', 'Manage key workers')
      .and('have.attr', 'href')
      .should(
        'equal',
        `/key-worker/manage?query=&status=ACTIVE&history=${historyToBase64(['/key-worker', '/key-worker/manage?query=&status=ACTIVE'], true)}`,
      )

    cy.get('a[href*="prisoner-allocation-history"]').eq(0).click()

    cy.get('.govuk-breadcrumbs__link').should('have.length', 4)
    cy.get('.govuk-breadcrumbs__link')
      .eq(0)
      .should('include.text', 'Digital Prison Services')
      .and('have.attr', 'href')
      .should('equal', 'http://localhost:3001')
    cy.get('.govuk-breadcrumbs__link')
      .eq(1)
      .should('include.text', 'Key worker')
      .and('have.attr', 'href')
      .should('equal', `/key-worker?history=${historyToBase64(['/key-worker'], true)}`)
    cy.get('.govuk-breadcrumbs__link')
      .eq(2)
      .should('include.text', 'Manage key workers')
      .and('have.attr', 'href')
      .should(
        'equal',
        `/key-worker/manage?query=&status=ACTIVE&history=${historyToBase64(['/key-worker', '/key-worker/manage?query=&status=ACTIVE'], true)}`,
      )
    cy.get('.govuk-breadcrumbs__link')
      .eq(3)
      .should('include.text', 'Profile')
      .and('have.attr', 'href')
      .should(
        'equal',
        `/key-worker/staff-profile/488095?history=${historyToBase64(['/key-worker', '/key-worker/manage?query=&status=ACTIVE', '/key-worker/staff-profile/488095'], true)}`,
      )
  })
})
