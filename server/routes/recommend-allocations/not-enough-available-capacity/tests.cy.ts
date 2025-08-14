import AuthorisedRoles from '../../../authentication/authorisedRoles'

context('/recommend-allocations not enough capacity interrupt card', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn', {
      roles: [AuthorisedRoles.OMIC_ADMIN, AuthorisedRoles.KEYWORKER_MONITOR, AuthorisedRoles.KW_MIGRATION],
    })
    cy.task('stubEnabledPrison')
    cy.task('stubResidentialHierarchy')
    cy.task('stubSearchPrisoner')
    cy.task('stubSearchAllocatableStaffAll')
    cy.task('stubSearchPrisonersWithExcludeAllocations')
    cy.task('stubSearchAllocatableStaffStatusActive')
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
  })

  it('should show warning message when there is only capacity to partially auto allocate', () => {
    navigateToTestPage()
    cy.findByRole('heading', { name: 'Not enough available capacity to allocate all prisoners' }).should('be.visible')
    cy.findByText('Key workers could not be recommended for 1 out of 2 prisoners.').should('be.visible')
    cy.findByRole('button', { name: 'Continue' })
      .should('be.visible')
      .and('have.attr', 'href')
      .should('match', /\/key-worker\/recommend-allocations\?allowPartialAllocation=true/)
    cy.findByRole('link', { name: 'Go back' })
      .should('be.visible')
      .and('have.attr', 'href')
      .should('match', /\/key-worker\/allocate\?query=&cellLocationPrefix=1&excludeActiveAllocations=true/)
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(
      `/key-worker/recommend-allocations?history=WyIva2V5LXdvcmtlciIsIi9rZXktd29ya2VyL2FsbG9jYXRlIiwiL2tleS13b3JrZXIvYWxsb2NhdGU%2FcXVlcnk9JmNlbGxMb2NhdGlvblByZWZpeD0xJmV4Y2x1ZGVBY3RpdmVBbGxvY2F0aW9ucz10cnVlIiwiL2tleS13b3JrZXIvcmVjb21tZW5kLWFsbG9jYXRpb25zIl0%3D`,
      {
        failOnStatusCode: false,
      },
    )
  }
})
