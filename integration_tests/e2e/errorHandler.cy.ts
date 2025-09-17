import { v4 as uuidV4 } from 'uuid'

context('test errorHandler', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubComponents')
    cy.task('stubEnabledPrison')
  })

  it('should say page not found when 404', () => {
    cy.signIn()
    cy.visit(`/foobar`, { failOnStatusCode: false })
    cy.findByRole('heading', { name: /Page not found/i }).should('be.visible')

    cy.verifyAuditEvents([
      {
        who: 'USER1',
        subjectType: 'NOT_APPLICABLE',
        details: '{"pageUrl":"/foobar","activeCaseLoadId":"LEI"}',
        what: 'PAGE_VIEW_ACCESS_ATTEMPT',
        service: 'DPS023',
      },
    ])
  })

  it('should show error page for 4XX API error', () => {
    cy.task('stubSearchStaff400')
    cy.signIn()
    const journeyId = uuidV4()
    cy.visit(`/key-worker/${journeyId}/manage-roles/assign`, {
      failOnStatusCode: false,
    })

    cy.findByRole('textbox', { name: 'Find a staff member' }).type('Joe')
    cy.findByRole('button', { name: 'Search' }).click()

    cy.findByText(/sorry, there is a problem with the service/i).should('be.visible')

    cy.verifyAPIWasCalled(
      {
        method: 'POST',
        urlPath: '/keyworker-api/search/prisons/LEI/staff',
      },
      1,
    )
  })

  it('should retry on 5XX API error', () => {
    cy.task('stubSearchStaffRetry')
    cy.signIn()
    const journeyId = uuidV4()
    cy.visit(`/key-worker/${journeyId}/manage-roles/assign`, {
      failOnStatusCode: false,
    })

    cy.findByRole('textbox', { name: 'Find a staff member' }).type('Joe')
    cy.findByRole('button', { name: 'Search' }).click()

    cy.findByText('There are no results for this name or email address at Leeds (HMP)').should('be.visible')

    cy.verifyAPIWasCalled(
      {
        method: 'POST',
        urlPath: '/keyworker-api/search/prisons/LEI/staff',
      },
      3,
    )
  })
})
