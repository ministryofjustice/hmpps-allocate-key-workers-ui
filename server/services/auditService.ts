import HmppsAuditClient, { AuditEvent } from '../data/hmppsAuditClient'

export enum Page {
  EXAMPLE_PAGE = 'EXAMPLE_PAGE',
  HOMEPAGE = 'HOMEPAGE',
  ALLOCATE = 'ALLOCATE',
  RECOMMENDED_ALLOCATIONS = 'RECOMMENDED_ALLOCATIONS',
  PRISONER_ALLOCATION_HISTORY = 'PRISONER_ALLOCATION_HISTORY',
  MANAGE_ALLOCATABLE_STAFF = 'MANAGE_ALLOCATABLE_STAFF',
  STAFF_ALLOCATIONS = 'STAFF_ALLOCATIONS',
  UPDATE_STAFF_CONFIGURATION = 'UPDATE_STAFF_CONFIGURATION',
  PRISON_STATISTICS = 'PRISON_STATISTICS',
  UPDATE_STAFF_JOB_CLASSIFICATION = 'UPDATE_STAFF_JOB_CLASSIFICATION',
  ESTABLISHMENT_SETTINGS = 'ESTABLISHMENT_SETTINGS',
}

export interface PageViewEventDetails {
  who: string
  subjectId?: string
  subjectType?: string
  correlationId?: string
  details?: object
}

export default class AuditService {
  constructor(private readonly hmppsAuditClient: HmppsAuditClient) {}

  async logAuditEvent(event: AuditEvent) {
    await this.hmppsAuditClient.sendMessage(event, false)
  }

  async logPageView(page: Page, eventDetails: PageViewEventDetails) {
    const event: AuditEvent = {
      ...eventDetails,
      what: `PAGE_VIEW_${page}`,
    }
    await this.hmppsAuditClient.sendMessage(event, false)
  }
}
