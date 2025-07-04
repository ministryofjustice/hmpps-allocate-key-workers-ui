import { v4 as uuidV4 } from 'uuid'

context('/manage-roles/assign/** journey', () => {
  let journeyId = uuidV4()

  const getSearchInput = () => cy.findByRole('textbox', { name: 'Find a staff member' })
  const getSearchButton = () => cy.findByRole('button', { name: 'Search' })
  const yesRadio = () => cy.findByRole('radio', { name: 'Yes' })
  const noRadio = () => cy.findByRole('radio', { name: 'No' })
  const fullTimeRadio = () => cy.findByRole('radio', { name: 'Full-time' })
  const partTimeRadio = () => cy.findByRole('radio', { name: 'Part-time' })
  const capacityInput = () =>
    cy.findByRole('textbox', {
      name: 'What is the maximum number of prisoners this prison officer should be assigned?',
    })
  const continueButton = () => cy.findByRole('button', { name: 'Continue' })

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
      },
      {
        staffId: 1002,
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        username: 'JOHN_SMITH',
      },
    ])
    cy.task('stubUpsertStaffDetails')
  })

  it('should end with error page if staff member is not a prison officer', () => {
    beginJourney()

    getSearchInput().type('Joe')
    getSearchButton().click()
    cy.findByRole('link', { name: 'Doe, Joe' }).click()

    noRadio().click()
    continueButton().click()

    cy.url().should('match', /\/assign\/not-prison-officer$/)
    cy.title().should('equal', 'Not a prison officer - Key workers - DPS')
    cy.findByRole('heading', {
      name: 'You cannot make this person a key worker',
    }).should('be.visible')
  })

  it('should end with error page if change answer for Prison Officer to No', () => {
    beginJourney()

    getSearchInput().type('Joe')
    getSearchButton().click()
    cy.findByRole('link', { name: 'Doe, Joe' }).click()

    yesRadio().click()
    continueButton().click()

    fullTimeRadio().click()
    continueButton().click()

    continueButton().click()

    // change answer
    cy.findByRole('link', { name: /Change whether the staff member is a prison officer/i }).click()
    noRadio().click()
    continueButton().click()

    cy.url().should('match', /\/assign\/not-prison-officer$/)
    cy.title().should('equal', 'Not a prison officer - Key workers - DPS')
    cy.findByRole('heading', {
      name: 'You cannot make this person a key worker',
    }).should('be.visible')
  })

  it('should assign role to staff member', () => {
    beginJourney()

    getSearchInput().type('Joe')
    getSearchButton().click()
    cy.findByRole('link', { name: 'Doe, Joe' }).click()

    yesRadio().click()
    continueButton().click()

    fullTimeRadio().click()
    continueButton().click()

    continueButton().click()

    // Can change answers
    cy.findByRole('link', { name: /Change the staff member$/i }).click()
    getSearchInput().clear().type('John')
    getSearchButton().click()
    cy.findByRole('link', { name: 'Smith, John' }).click()

    cy.findByRole('link', { name: /Change the staff member’s working pattern/i }).click()
    partTimeRadio().click()
    continueButton().click()

    cy.findByRole('link', { name: /Change the staff member’s maximum capacity/i }).click()
    capacityInput().clear().type('9')
    continueButton().click()

    // Confirm and submit
    cy.findByRole('button', { name: 'Confirm and submit' }).click()

    cy.findByText('You have successfully made Smith, John a key worker').should('be.visible')

    cy.verifyLastAPICall(
      { method: 'PUT', urlPath: '/keyworker-api/prisons/LEI/staff/1002' },
      {
        staffRole: {
          position: 'PRO',
          scheduleType: 'PT',
          hoursPerWeek: 6,
          capacity: 9,
        },
      },
    )
  })

  it('should not submit capacity if it is the same as default prison settings', () => {
    beginJourney()

    getSearchInput().type('Joe')
    getSearchButton().click()
    cy.findByRole('link', { name: 'Doe, Joe' }).click()

    yesRadio().click()
    continueButton().click()

    fullTimeRadio().click()
    continueButton().click()

    continueButton().click()

    // Confirm and submit
    cy.findByRole('button', { name: 'Confirm and submit' }).click()

    cy.findByText('You have successfully made Doe, Joe a key worker').should('be.visible')

    cy.verifyLastAPICall(
      { method: 'PUT', urlPath: '/keyworker-api/prisons/LEI/staff/1001' },
      {
        staffRole: {
          position: 'PRO',
          scheduleType: 'FT',
          hoursPerWeek: 35,
        },
      },
    )
  })

  const beginJourney = () => {
    journeyId = uuidV4()
    cy.signIn({ failOnStatusCode: false })
    cy.visit(`/key-worker/${journeyId}/manage-roles/assign`, {
      failOnStatusCode: false,
    })
  }
})
