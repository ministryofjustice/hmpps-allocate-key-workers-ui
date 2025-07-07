import { CsrfTokenGenerator } from 'csrf-sync'
import { HmppsUser } from '../../interfaces/hmppsUser'
import { components } from '../keyWorker'
import Prisoner from '../../services/prisonerSearch/prisoner'

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
  keyWorkerDetails?: components['schemas']['StaffDetails']
  updateCapacityStatus?: UpdateCapacityStatusJourney
  assignStaffRole?: AssignStaffRoleJourney
  removeStaffRole?: RemoveStaffRoleJourney
}

export type UpdateCapacityStatusJourney = Partial<{
  capacity: number
  status: ReferenceData
  deactivateActiveAllocations: boolean
  removeFromAutoAllocation: boolean
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
        policy?: 'KEY_WORKER' | 'PERSONAL_OFFICER'
        prisonConfiguration?: components['schemas']['PrisonConfigResponse']
      }
    }

    interface Response {
      notFound(): void
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
      policyName?: string
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
    }
  }
}
