import { stubFor } from './wiremock'

const stubKeyworkerApiHealth = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/keyworker-api/health/ping',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: 'UP' },
    },
  })

const stubKeyworkerApiStatusIsKeyworker = (isKeyworker: boolean) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/keyworker-api/prisons/LEI/key-workers/USER1/status',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { isKeyworker },
    },
  })

const stubKeyworkerApiStatusFail = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/keyworker-api/prisons/LEI/key-workers/USER1/status',
    },
    response: {
      status: 500,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {},
    },
  })

const stubKeyworkerMigrationStatus = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: '/keyworker-api/key-worker/prison/(.*)',
    },
    response: {
      status: 200,
      jsonBody: {
        prisonId: 'LEI',
        supported: true,
        migrated: true,
        autoAllocatedSupported: true,
        capacityTier1: 6,
        capacityTier2: 9,
        kwSessionFrequencyInWeeks: 1,
        migratedDateTime: '2025-01-01T01:12:55.000',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    },
  })

const stubKeyworkerApiStats2025 = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: '/keyworker-api/key-worker-stats',
      queryParameters: {
        prisonId: {
          matches: '.+',
        },
        fromDate: {
          matches: '2025.+',
        },
        toDate: {
          matches: '.+',
        },
      },
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        summary: {
          requestedFromDate: '2025-01-01',
          requestedToDate: '2025-01-31',
          current: {
            dataRangeFrom: '2025-01-11',
            dataRangeTo: '2025-01-11',
            numPrisonersAssignedKeyWorker: 1337,
            totalNumPrisoners: 1918,
            totalNumEligiblePrisoners: 1169,
            numberKeyWorkerSessions: 0,
            numberKeyWorkerEntries: 0,
            numberOfActiveKeyworkers: 8,
            percentagePrisonersWithKeyworker: 69.69,
            numProjectedKeyworkerSessions: 167,
            complianceRate: 0,
          },
          previous: {
            dataRangeFrom: '2024-12-03',
            dataRangeTo: '2024-12-03',
            numPrisonersAssignedKeyWorker: 1072,
            totalNumPrisoners: 1165,
            totalNumEligiblePrisoners: 1165,
            numberKeyWorkerSessions: 0,
            numberKeyWorkerEntries: 0,
            numberOfActiveKeyworkers: 6,
            percentagePrisonersWithKeyworker: 42,
            numProjectedKeyworkerSessions: 166,
            complianceRate: 0,
          },
          complianceTimeline: {
            '2024-04-14': 0,
            '2024-05-19': 0,
            '2024-06-02': 0,
            '2024-08-18': 0,
            '2024-11-10': 0,
            '2024-12-01': 0,
            '2025-01-05': 0,
          },
          avgOverallCompliance: 0,
          keyworkerSessionsTimeline: {
            '2024-04-14': 0,
            '2024-05-19': 0,
            '2024-06-02': 0,
            '2024-08-18': 0,
            '2024-11-10': 0,
            '2024-12-01': 0,
            '2025-01-05': 0,
          },
          avgOverallKeyworkerSessions: 0,
        },
      },
    },
  })

const stubKeyworkerApiStats2024 = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: '/keyworker-api/key-worker-stats',
      queryParameters: {
        prisonId: {
          matches: '.+',
        },
        fromDate: {
          matches: '2024.+',
        },
        toDate: {
          matches: '.+',
        },
      },
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        summary: {
          requestedFromDate: '2024-01-01',
          requestedToDate: '2024-01-31',
          current: {
            dataRangeFrom: '2024-01-11',
            dataRangeTo: '2024-01-11',
            numPrisonersAssignedKeyWorker: 4200,
            totalNumPrisoners: 6900,
            totalNumEligiblePrisoners: 5000,
            numberKeyWorkerSessions: 1,
            numberKeyWorkerEntries: 1,
            numberOfActiveKeyworkers: 24,
            percentagePrisonersWithKeyworker: 61,
            numProjectedKeyworkerSessions: 200,
            complianceRate: 0,
          },
          previous: {
            dataRangeFrom: '2023-12-03',
            dataRangeTo: '2023-12-03',
            numPrisonersAssignedKeyWorker: 4205,
            totalNumPrisoners: 7000,
            totalNumEligiblePrisoners: 6500,
            numberKeyWorkerSessions: 3,
            numberKeyWorkerEntries: 5,
            numberOfActiveKeyworkers: 2,
            percentagePrisonersWithKeyworker: 60,
            numProjectedKeyworkerSessions: 169,
            complianceRate: 0,
          },
          complianceTimeline: {
            '2023-04-14': 0,
            '2023-05-19': 0,
            '2023-06-02': 0,
            '2023-08-18': 0,
            '2023-11-10': 0,
            '2023-12-01': 0,
            '2024-01-05': 0,
          },
          avgOverallCompliance: 0,
          keyworkerSessionsTimeline: {
            '2023-04-14': 0,
            '2023-05-19': 0,
            '2023-06-02': 0,
            '2023-08-18': 0,
            '2023-11-10': 0,
            '2023-12-01': 0,
            '2024-01-05': 0,
          },
          avgOverallKeyworkerSessions: 0,
        },
      },
    },
  })

const stubKeyworkerApiStatsNoData = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: '/keyworker-api/key-worker-stats',
      queryParameters: {
        prisonId: {
          matches: '.+',
        },
        fromDate: {
          matches: '.+',
        },
        toDate: {
          matches: '.+',
        },
      },
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        summary: {
          requestedFromDate: '2025-01-01',
          requestedToDate: '2025-01-31',
          complianceTimeline: {
            '2024-04-14': 0,
            '2024-05-19': 0,
            '2024-06-02': 0,
            '2024-08-18': 0,
            '2024-11-10': 0,
            '2024-12-01': 0,
            '2025-01-05': 0,
          },
          avgOverallCompliance: 0,
          keyworkerSessionsTimeline: {
            '2024-04-14': 0,
            '2024-05-19': 0,
            '2024-06-02': 0,
            '2024-08-18': 0,
            '2024-11-10': 0,
            '2024-12-01': 0,
            '2025-01-05': 0,
          },
          avgOverallKeyworkerSessions: 0,
        },
      },
    },
  })

export default {
  stubKeyworkerApiHealth,
  stubKeyworkerApiStatusIsKeyworker: () => stubKeyworkerApiStatusIsKeyworker(true),
  stubKeyworkerApiStatusIsNotKeyworker: () => stubKeyworkerApiStatusIsKeyworker(false),
  stubKeyworkerApiStatusFail: () => stubKeyworkerApiStatusFail(),
  stubKeyworkerApiStats2025,
  stubKeyworkerApiStats2024,
  stubKeyworkerMigrationStatus,
  stubKeyworkerApiStatsNoData,
}
