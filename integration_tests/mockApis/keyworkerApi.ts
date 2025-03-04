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
      urlPathPattern: '/keyworker-api/prisons/LEI/keyworker/configuration',
    },
    response: {
      status: 200,
      jsonBody: {
        isEnabled: true,
        hasPrisonersWithHighComplexityNeeds: true,
        allowAutoAllocate: true,
        capacityTier1: 6,
        capacityTier2: 9,
        kwSessionFrequencyInWeeks: 1,
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
      urlPathPattern: '/keyworker-api/prisons/LEI/keyworker/statistics',
      queryParameters: {
        from: {
          matches: '2025.+',
        },
        to: {
          matches: '.+',
        },
      },
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        prisonCode: 'LEI',
        current: {
          from: '2025-01-11',
          to: '2025-01-11',
          prisonersAssignedKeyworker: 4200,
          totalPrisoners: 6900,
          eligiblePrisoners: 5000,
          keyworkerSessions: 1,
          keyworkerEntries: 1,
          activeKeyworkers: 24,
          percentageWithKeyworker: 61,
          projectedSessions: 200,
          compliance: 0,
        },
        previous: {
          from: '2023-12-03',
          to: '2023-12-03',
          prisonersAssignedKeyworker: 4205,
          totalPrisoners: 7000,
          eligiblePrisoners: 6500,
          keyworkerSessions: 3,
          keyworkerEntries: 5,
          activeKeyworkers: 2,
          percentageWithKeyworker: 60,
          projectedSessions: 169,
          compliance: 0,
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
        averageCompliance: 0,
        sessionTimeline: {
          '2023-04-14': 0,
          '2023-05-19': 0,
          '2023-06-02': 0,
          '2023-08-18': 0,
          '2023-11-10': 0,
          '2023-12-01': 0,
          '2024-01-05': 0,
        },
        averageSessions: 0,
      },
    },
  })

const stubKeyworkerApiStats2024 = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: '/keyworker-api/prisons/LEI/keyworker/statistics',
      queryParameters: {
        from: {
          matches: '2024.+',
        },
        to: {
          matches: '.+',
        },
      },
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        prisonCode: 'LEI',
        current: {
          from: '2024-01-11',
          to: '2024-01-11',
          prisonersAssignedKeyworker: 4200,
          totalPrisoners: 6900,
          eligiblePrisoners: 5000,
          keyworkerSessions: 1,
          keyworkerEntries: 1,
          activeKeyworkers: 24,
          percentageWithKeyworker: 61,
          projectedSessions: 200,
          compliance: 0,
        },
        previous: {
          from: '2023-12-03',
          to: '2023-12-03',
          prisonersAssignedKeyworker: 4205,
          totalPrisoners: 7000,
          eligiblePrisoners: 6500,
          keyworkerSessions: 3,
          keyworkerEntries: 5,
          activeKeyworkers: 2,
          percentageWithKeyworker: 60,
          projectedSessions: 169,
          compliance: 0,
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
        averageCompliance: 0,
        sessionTimeline: {
          '2023-04-14': 0,
          '2023-05-19': 0,
          '2023-06-02': 0,
          '2023-08-18': 0,
          '2023-11-10': 0,
          '2023-12-01': 0,
          '2024-01-05': 0,
        },
        averageSessions: 0,
      },
    },
  })

const stubKeyworkerApiStatsNoData = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: '/keyworker-api/prisons/LEI/keyworker/statistics',
      queryParameters: {
        from: {
          matches: '.+',
        },
        to: {
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
          averageCompliance: 0,
          sessionTimeline: {
            '2024-04-14': 0,
            '2024-05-19': 0,
            '2024-06-02': 0,
            '2024-08-18': 0,
            '2024-11-10': 0,
            '2024-12-01': 0,
            '2025-01-05': 0,
          },
          averageSessions: 0,
        },
      },
    },
  })

const stubPrisonNoHighRisk = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: '/keyworker-api/prisons/LEI/keyworker/configuration',
    },
    response: {
      status: 200,
      jsonBody: {
        isEnabled: true,
        hasPrisonersWithHighComplexityNeeds: false,
        allowAutoAllocate: true,
        capacityTier1: 6,
        capacityTier2: 9,
        kwSessionFrequencyInWeeks: 1,
      },
      headers: {
        'Content-Type': 'application/json',
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
  stubPrisonNoHighRisk,
}
