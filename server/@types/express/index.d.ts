import { CsrfTokenGenerator } from 'csrf-sync'
import { HmppsUser } from '../../interfaces/hmppsUser'

export declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
  }
}

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
    }

    interface Response {
      notFound(): void
    }

    interface Locals {
      cspNonce: string
      csrfToken: ReturnType<CsrfTokenGenerator>
      user: HmppsUser
      digitalPrisonServicesUrl: string
      breadcrumbs: Breadcrumbs
      prisoner?: PrisonerSummary
      buildNumber?: string
      asset_path: string
      applicationName: string
      environmentName: string
      environmentNameColour: string
      feComponentsMeta?: {
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
