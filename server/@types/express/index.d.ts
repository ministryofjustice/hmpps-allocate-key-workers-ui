import { CsrfTokenGenerator } from 'csrf-sync'
import { HmppsUser } from '../../interfaces/hmppsUser'
import { components } from '../keyWorker'
import Prisoner from '../../services/prisonerSearch/prisoner'
import { Breadcrumbs } from '../../middleware/breadcrumbs'
import { AuditEvent } from '../../data/hmppsAuditClient'
import { Page } from '../../services/auditService'
import { PolicyType } from '../policyType'

export declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
  }
}

type ReferenceData = {
  code: string
  description: string
}

export type JourneyData = {
  instanceUnixEpoch: number
  isCheckAnswers?: boolean
  journeyCompleted?: boolean
  staffDetails?: components['schemas']['StaffDetails']
  updateStaffDetails?: UpdateStaffDetailsJourney
  assignStaffRole?: AssignStaffRoleJourney
  removeStaffRole?: RemoveStaffRoleJourney
}

export type UpdateStaffDetailsJourney = Partial<{
  status: ReferenceData
  deactivateActiveAllocations: boolean
  reactivateOn: string
}>

export type StaffSummary = {
  staffId: number
  firstName: string
  lastName: string
  username: string
  email: string | undefined
}

export type StaffSummaryWithRole = StaffSummary & {
  allocated: number
  staffRole: {
    position: ReferenceData
    scheduleType: ReferenceData
    hoursPerWeek: number
    fromDate: string
    toDate?: string
  }
}

export type AssignStaffRoleJourney = Partial<{
  query: string
  searchResults: StaffSummary[]
  staff: StaffSummary
  isPrisonOfficer: boolean
  scheduleType: ReferenceData
  hoursPerWeek: number
  capacity: number
}>

export type RemoveStaffRoleJourney = Partial<{
  query: string
  searchResults: StaffSummaryWithRole[]
  staff: StaffSummaryWithRole
}>

export declare global {
  namespace Express {
    interface User {
      username: string
      token: string
      authSource: string
    }

    interface Request {
      verified?: boolean
      id: string
      journeyData: JourneyData

      logout(done: (err: unknown) => void): void
      systemClientToken: string

      middleware?: {
        prisonerData?: Prisoner
        policy?: PolicyType
        prisonConfiguration?: components['schemas']['PrisonConfigResponse']
      }
    }

    interface Response {
      notFound(): void
      getPageViewEvent(isAttempt: boolean): AuditEvent
      setAuditDetails: {
        prisonNumber(prisonNumber: string): void
        searchTerm(searchTerm: string): void
        staffId(staffId: number | string): void
      }
      sendApiEvent?: (apiUrl: string, isAttempt: boolean) => void
    }

    interface Locals {
      cspNonce: string
      csrfToken: ReturnType<CsrfTokenGenerator>
      user: HmppsUser
      formResponses?: { [key: string]: string }
      digitalPrisonServicesUrl: string
      legacyKeyWorkersUiUrl: string
      breadcrumbs: Breadcrumbs
      prisoner?: PrisonerSummary
      policyStaff?: string
      policyStaffs?: string
      policyPath?: string
      buildNumber?: string
      asset_path: string
      applicationName: string
      environmentName: string
      environmentNameColour: string
      feComponents?: {
        sharedData?: {
          activeCaseLoad: CaseLoad
          caseLoads: CaseLoad[]
          services: {
            id: string
            heading: string
            description: string
            href: string
            navEnabled: boolean
          }[]
        }
      }
      auditEvent: {
        who: string
        correlationId: string
        subjectId?: string
        subjectType?: string
        details?: {
          activeCaseLoadId?: string
          pageUrl: string
          pageName?: Page
          policy?: PolicyType
          staffId?: string
          query?: string
          [key: string]: unknown
        }
      }
    }
  }
}
