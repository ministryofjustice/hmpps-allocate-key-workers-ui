import { defaultPrisonerAllocation } from '../../../integration_tests/mockApis/keyworkerApi'
import { createMock } from '../../testutils/mockObjects'

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

  describe('Role based access', () => {
    it('should deny access to a user with only policy job access', () => {
      cy.task('stubSignIn', {
        roles: [],
        hasAllocationJobResponsibilities: true,
      })

      navigateToTestPage()

      cy.url().should('to.match', /\/key-worker\/not-authorised/)
    })
  })

  it('adds back query params on the back link', () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/key-worker/prisoner-allocation-history/A9965EA?query=&location=&excludeActiveAllocations=true', {
      failOnStatusCode: false,
    })

    cy.findByRole('link', { name: /back/i }).should(
      'have.attr',
      'href',
      '/key-worker/allocate?query=&location=&excludeActiveAllocations=true',
    )
  })

  it('happy path', () => {
    navigateToTestPage()
    cy.title().should('equal', 'Prisoner key worker allocation history - Key workers - DPS')
    cy.findByRole('link', { name: /back/i }).should('have.attr', 'href', '/key-worker/allocate')

    cy.get('h1').should('have.text', 'Cat, Tabby (A9965EA)')

    cy.get('.govuk-heading-l').eq(0).should('have.text', 'Prisoner key worker allocation history')
    cy.findByText('Current and previous allocations: 2').should('be.visible')

    // Current key worker card
    cy.get('.govuk-summary-card')
      .eq(0)
      .within(() => {
        cy.get('.govuk-summary-card__title').eq(0).should('include.text', 'Current key worker: Sample Keyworker')

        cy.contains('dt', 'Establishment').next().should('include.text', 'Moorland (HMP & YOI)')
        cy.contains('dt', 'Allocated on').next().should('include.text', '17/04/2025 14:41')
        cy.contains('dt', 'Allocated by').next().should('include.text', 'Test Keyworker')
        cy.contains('dt', 'Deallocated on').next().should('include.text', '-')
        cy.contains('dt', 'Deallocated by').next().should('include.text', '-')
        cy.contains('dt', 'Deallocation reason').next().should('include.text', '-')
      })

    // Previous key worker card
    cy.get('.govuk-summary-card')
      .eq(1)
      .within(() => {
        cy.get('.govuk-summary-card__title').eq(0).should('include.text', 'Previous key worker: Smith Last-Name')

        cy.contains('dt', 'Establishment').next().should('include.text', 'Moorland (HMP & YOI)')
        cy.contains('dt', 'Allocated on').next().should('include.text', '18/12/2024 10:56')
        cy.contains('dt', 'Allocated by').next().should('include.text', 'Foo Baz')
        cy.contains('dt', 'Deallocated on').next().should('include.text', '12/02/2025 15:57')
        cy.contains('dt', 'Deallocated by').next().should('include.text', 'Fake Doe')
        cy.contains('dt', 'Deallocation reason').next().should('include.text', 'Manual')
      })
  })

  it('correctly maps deallocation reasons', () => {
    cy.task('stubPrisonerAllocations', [
      createMock(defaultPrisonerAllocation, { deallocated: { reason: { code: 'OVERRIDE', description: 'Override' } } }),
      createMock(defaultPrisonerAllocation, { deallocated: { reason: { code: 'MISSING', description: 'Missing' } } }),
      createMock(defaultPrisonerAllocation, {
        deallocated: { reason: { code: 'DUPLICATE', description: 'Duplicate' } },
      }),
      createMock(defaultPrisonerAllocation, { deallocated: { reason: { code: 'MERGED', description: 'Merged' } } }),
      createMock(defaultPrisonerAllocation, { deallocated: { reason: { code: 'MANUAL', description: 'Manual' } } }),
      createMock(defaultPrisonerAllocation, { deallocated: { reason: { code: 'RELEASED', description: 'Released' } } }),
      createMock(defaultPrisonerAllocation, {
        deallocated: { reason: { code: 'KEYWORKER_STATUS_CHANGE', description: 'Keyworker Status Changed' } },
      }),
      createMock(defaultPrisonerAllocation, { deallocated: { reason: { code: 'TRANSFER', description: 'Transfer' } } }),
      createMock(defaultPrisonerAllocation, {
        deallocated: { reason: { code: 'CHANGE_IN_COMPLEXITY_OF_NEED', description: 'Change in complexity of need' } },
      }),
    ])

    navigateToTestPage()

    cy.get('.govuk-summary-card')
      .eq(0)
      .within(() => {
        cy.contains('dt', 'Deallocation reason').next().should('include.text', 'Manual')
      })

    cy.get('.govuk-summary-card')
      .eq(1)
      .within(() => {
        cy.contains('dt', 'Deallocation reason').next().should('include.text', 'Automatic')
      })

    cy.get('.govuk-summary-card')
      .eq(2)
      .within(() => {
        cy.contains('dt', 'Deallocation reason').next().should('include.text', 'Automatic')
      })

    cy.get('.govuk-summary-card')
      .eq(3)
      .within(() => {
        cy.contains('dt', 'Deallocation reason').next().should('include.text', 'Automatic')
      })

    cy.get('.govuk-summary-card')
      .eq(4)
      .within(() => {
        cy.contains('dt', 'Deallocation reason').next().should('include.text', 'Manual')
      })

    cy.get('.govuk-summary-card')
      .eq(5)
      .within(() => {
        cy.contains('dt', 'Deallocation reason').next().should('include.text', 'Released')
      })

    cy.get('.govuk-summary-card')
      .eq(6)
      .within(() => {
        cy.contains('dt', 'Deallocation reason').next().should('include.text', 'Keyworker Status Changed')
      })

    cy.get('.govuk-summary-card')
      .eq(7)
      .within(() => {
        cy.contains('dt', 'Deallocation reason').next().should('include.text', 'Transfer')
      })

    cy.get('.govuk-summary-card')
      .eq(8)
      .within(() => {
        cy.contains('dt', 'Deallocation reason').next().should('include.text', 'Change in complexity of need')
      })
  })

  const navigateToTestPage = () => {
    cy.signIn({ failOnStatusCode: false })
    cy.visit('/key-worker/prisoner-allocation-history/A9965EA', { failOnStatusCode: false })
  }
})
