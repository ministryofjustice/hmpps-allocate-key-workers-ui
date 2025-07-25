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
      .and(
        'have.attr',
        'href',
        '/key-worker/recommend-allocations?allowPartialAllocation=true&backTo=%2Fkey-worker%2Fallocate%3Fquery%3D%26cellLocationPrefix%3D%26excludeActiveAllocations%3Dtrue',
      )
    cy.findByRole('link', { name: 'Go back' })
      .should('be.visible')
      .and('have.attr', 'href', '/key-worker/allocate?query=&cellLocationPrefix=&excludeActiveAllocations=true')
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(
      `/key-worker/recommend-allocations?backTo=%2Fkey-worker%2Fallocate%3Fquery%3D%26cellLocationPrefix%3D%26excludeActiveAllocations%3Dtrue`,
      {
        failOnStatusCode: false,
      },
    )
  }
})
