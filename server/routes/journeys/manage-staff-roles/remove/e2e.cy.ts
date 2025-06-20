import { v4 as uuidV4 } from 'uuid'
import { todayString } from '../../../../utils/datetimeUtils'

context('/manage-staff-roles/remove/** journey', () => {
  const journeyId = uuidV4()

  const getSearchInput = () => cy.findByRole('textbox', { name: 'Find a staff member' })
  const getSearchButton = () => cy.findByRole('button', { name: 'Search' })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubComponents')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
    cy.task('stubSearchStaff', [
      {
        staffId: 1001,
        firstName: 'Joe',
        lastName: 'Doe',
        email: 'joe.doe@email.com',
        username: 'JOE_DOE',
        allocated: 12,
        staffRole: {
          position: { code: 'PRO', description: 'Prison officer' },
          scheduleType: { code: 'FT', description: 'Full-time' },
          hoursPerWeek: 35,
          fromDate: '2010-01-12',
        },
      },
    ])
    cy.task('stubAssignRoleToStaff')
  })

  it('should remove role to staff member', () => {
    beginJourney()

    getSearchInput().type('Joe')
    getSearchButton().click()
    cy.findByRole('link', { name: 'Doe, Joe' }).click()

    cy.findByRole('button', { name: 'Yes, remove the role' }).click()

    cy.findByText('You have successfully removed the key worker role from Doe, Joe').should('be.visible')

    cy.verifyLastAPICall(
      { method: 'PUT', urlPath: '/keyworker-api/prisons/LEI/staff/1001/job-classification' },
      {
        position: 'PRO',
        scheduleType: 'FT',
        hoursPerWeek: 35,
        fromDate: '2010-01-12',
        toDate: todayString(),
      },
    )
  })

  const beginJourney = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit(`/key-worker/${journeyId}/manage-staff-roles/remove`, {
      failOnStatusCode: false,
    })
  }
})
