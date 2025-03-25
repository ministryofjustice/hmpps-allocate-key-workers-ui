import { stubFor } from './wiremock'

const createBasicHttpStub = (method: string, urlPattern: string, status: number, jsonBody: object = {}) => {
  return createHttpStub(method, urlPattern, undefined, undefined, status, jsonBody)
}

const createHttpStub = (
  method: string,
  urlPathPattern: string,
  queryParameters: object,
  bodyPatterns: Array<object> | undefined,
  status: number,
  jsonBody?: object,
) => {
  return stubFor({
    request: { method, urlPathPattern, queryParameters, bodyPatterns },
    response: {
      status,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody,
    },
  })
}

const stubKeyworkerApiHealth = () => createBasicHttpStub('GET', '/keyworker-api/health/ping', 200, { status: 'UP' })

const stubKeyworkerApiStatusIsKeyworker = (isKeyworker: boolean) =>
  createBasicHttpStub('GET', '/keyworker-api/prisons/LEI/key-workers/USER1/status', 200, { isKeyworker })

const stubKeyworkerApiStatusFail = () =>
  createBasicHttpStub('GET', '/keyworker-api/prisons/LEI/key-workers/USER1/status', 500, {})

const createKeyworkerStatsStub = (from: string, to: string, jsonBody = {}) => {
  return createHttpStub(
    'GET',
    '/keyworker-api/prisons/LEI/statistics/keyworker',
    { from: { matches: from }, to: { matches: to } },
    undefined,
    200,
    jsonBody,
  )
}
const stubKeyworkerPrisonConfig = (isEnabled: boolean, hasPrisonersWithHighComplexityNeeds: boolean) =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: '/keyworker-api/prisons/LEI/configuration/keyworker',
    },
    response: {
      status: 200,
      jsonBody: {
        isEnabled,
        hasPrisonersWithHighComplexityNeeds,
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

const stubKeyworkerApiStats2025 = () => createKeyworkerStatsStub('2025.+', '.+', keyworkerStatisticsResponse)

const stubKeyworkerApiStats2024 = () => createKeyworkerStatsStub('2024.+', '.+', keyworkerStatisticsResponse)

const stubKeyworkerApiStatsNoData = () =>
  createKeyworkerStatsStub('.+', '.+', {
    summary: {
      ...keyworkerStatisticsResponse,
      current: undefined,
      previous: undefined,
    },
  })

const stubKeyworkerMembersAll = () =>
  createHttpStub(
    'POST',
    '/keyworker-api/search/prisons/LEI/keyworkers',
    undefined,
    [
      {
        doesNotMatch: '.*"query".*',
        equalToJson: {
          name: 'query',
          values: ['ALL'],
        },
      },
    ],
    200,
    keyworkerManageResponse,
  )

const stubKeyworkerMembersError = () =>
  createHttpStub('POST', '/keyworker-api/search/prisons/LEI/keyworkers', undefined, undefined, 502, {})

const stubKeyworkerMembersNone = () =>
  createHttpStub(
    'POST',
    '/keyworker-api/search/prisons/LEI/keyworkers',
    undefined,
    [
      {
        equalToJson: {
          query: 'IDKLOL',
          status: 'ALL',
        },
      },
    ],
    200,
    { content: [] },
  )

const stubKeyworkerMembersQuery = () =>
  createHttpStub(
    'POST',
    '/keyworker-api/search/prisons/LEI/keyworkers',
    undefined,
    [
      {
        equalToJson: {
          query: 'AVAILABLE-ACTIVE',
          status: 'ALL',
        },
      },
    ],
    200,
    { content: [keyworkerManageResponse.content[0]] },
  )

const stubKeyworkerMembersStatus = () =>
  createHttpStub(
    'POST',
    '/keyworker-api/search/prisons/LEI/keyworkers',
    undefined,
    [
      {
        equalToJson: {
          query: '',
          status: 'INACTIVE',
        },
      },
    ],
    200,
    { content: keyworkerManageResponse.content.filter(o => o.status.code === 'INA') },
  )

const stubKeyworkerDetails = () =>
  createBasicHttpStub('GET', '/keyworker-api/prisons/LEI/keyworkers/485585', 200, keyworkerDetailsResponse)

const stubKeyWorkerStatsWithNullPreviousValues = () =>
  createKeyworkerStatsStub('.+', '.+', {
    ...keyworkerStatisticsResponse,
    previous: {
      from: '2025-01-11',
      to: '2025-01-11',
      totalPrisoners: 1169,
      eligiblePrisoners: 1169,
      prisonersAssignedKeyworker: 1077,
      activeKeyworkers: 8,
      keyworkerSessions: 0,
      keyworkerEntries: 0,
      avgReceptionToAllocationDays: null,
      avgReceptionToSessionDays: null,
      projectedSessions: 167,
      percentageWithKeyworker: null,
      compliance: 0,
    },
  })

const stubKeyWorkerStatsWithNullPreviousData = () =>
  createKeyworkerStatsStub('.+', '.+', {
    ...keyworkerStatisticsResponse,
    previous: undefined,
  })

const keyworkerManageResponse = {
  content: [
    {
      staffId: 488095,
      firstName: 'AVAILABLE-ACTIVE',
      lastName: 'KEY-WORKER',
      status: {
        code: 'ACT',
        description: 'Active',
      },
      capacity: 28,
      numberAllocated: 32,
      autoAllocationAllowed: true,
      numberOfKeyworkerSessions: 0,
    },
    {
      staffId: 488096,
      firstName: 'UNAVAILABLE-ANNUAL-LEAVE',
      lastName: 'KEY-WORKER',
      status: {
        code: 'UAL',
        description: 'Unavailable - annual leave',
      },
      capacity: 6,
      numberAllocated: 9,
      autoAllocationAllowed: true,
      numberOfKeyworkerSessions: 0,
    },
    {
      staffId: 488097,
      firstName: 'UNAVAILABLE-LONG-TERM-ABSENCE',
      lastName: 'KEY-WORKER',
      status: {
        code: 'ULT',
        description: 'Unavailable - long term absence',
      },
      capacity: 4,
      numberAllocated: 1,
      autoAllocationAllowed: false,
      numberOfKeyworkerSessions: 0,
    },
    {
      staffId: 488098,
      firstName: 'UNAVAILABLE-NO-PRISONER-CONTACT',
      lastName: 'KEY-WORKER',
      status: {
        code: 'UNP',
        description: 'Unavailable - no prisoner contact',
      },
      capacity: 12,
      numberAllocated: 0,
      autoAllocationAllowed: false,
      numberOfKeyworkerSessions: 0,
    },
    {
      staffId: 488099,
      firstName: 'UNAVAILABLE-INACTIVE',
      lastName: 'KEY-WORKER',
      status: {
        code: 'INA',
        description: 'Inactive',
      },
      capacity: 11,
      numberAllocated: 0,
      autoAllocationAllowed: false,
      numberOfKeyworkerSessions: 0,
    },
  ],
}

const keyworkerStatisticsResponse = {
  prisonCode: 'LEI',
  current: {
    from: '2025-02-06',
    to: '2025-02-28',
    totalPrisoners: 1172,
    eligiblePrisoners: 1172,
    prisonersAssignedKeyworker: 1078,
    activeKeyworkers: 11,
    keyworkerSessions: 1,
    keyworkerEntries: 0,
    avgReceptionToAllocationDays: 66,
    avgReceptionToSessionDays: 0,
    projectedSessions: 3851,
    percentageWithKeyworker: 91.98,
    compliance: 0.03,
  },
  previous: {
    from: '2025-01-11',
    to: '2025-01-11',
    totalPrisoners: 1169,
    eligiblePrisoners: 1169,
    prisonersAssignedKeyworker: 1077,
    activeKeyworkers: 8,
    keyworkerSessions: 0,
    keyworkerEntries: 0,
    avgReceptionToAllocationDays: 0,
    avgReceptionToSessionDays: 0,
    projectedSessions: 167,
    percentageWithKeyworker: 92.13,
    compliance: 0,
  },
  sessionTimeline: [
    {
      date: '2024-04-14',
      value: 0,
    },
    {
      date: '2024-05-19',
      value: 0,
    },
    {
      date: '2024-06-02',
      value: 0,
    },
    {
      date: '2024-08-18',
      value: 0,
    },
    {
      date: '2024-11-10',
      value: 0,
    },
    {
      date: '2024-12-01',
      value: 0,
    },
    {
      date: '2025-01-05',
      value: 0,
    },
    {
      date: '2025-02-02',
      value: 0,
    },
    {
      date: '2025-02-09',
      value: 0,
    },
    {
      date: '2025-02-16',
      value: 0,
    },
    {
      date: '2025-02-23',
      value: 1,
    },
  ],
  averageSessions: 0,
  complianceTimeline: [
    {
      date: '2024-04-14',
      value: 0,
    },
    {
      date: '2024-05-19',
      value: 0,
    },
    {
      date: '2024-06-02',
      value: 0,
    },
    {
      date: '2024-08-18',
      value: 0,
    },
    {
      date: '2024-11-10',
      value: 0,
    },
    {
      date: '2024-12-01',
      value: 0,
    },
    {
      date: '2025-01-05',
      value: 0,
    },
    {
      date: '2025-02-02',
      value: 0,
    },
    {
      date: '2025-02-09',
      value: 0,
    },
    {
      date: '2025-02-16',
      value: 0,
    },
    {
      date: '2025-02-23',
      value: 0.1,
    },
  ],
  averageCompliance: 0.01,
}

const keyworkerDetailsResponse = {
  keyworker: {
    staffId: 485585,
    firstName: 'AVAILABLE-ACTIVE',
    lastName: 'KEY-WORKER',
    scheduleType: {
      code: 'FT',
      description: 'Full Time',
    },
  },
  status: {
    code: 'ACT',
    description: 'Active',
  },
  prison: {
    code: 'LEI',
    description: 'Leeds',
  },
  capacity: 6,
  allocated: 1,
  allocations: [
    {
      prisoner: {
        prisonNumber: 'A9013EA',
        firstName: 'SECOND',
        lastName: 'BLUE',
        csra: 'Standard',
        cellLocation: '	1-2-011',
        releaseDate: '2025-02-01',
      },
      location: 'Leeds',
      latestSession: { 
        occurredAt: '2025-01-23',
      },
    },
  ],
  stats: {
    current: {
      from: '2025-02-17',
      to: '2025-03-17',
      projectedSessions: 1,
      recordedSessions: 3,
      recordedEntries: 2,
      complianceRate: 0,
    },
    previous: {
      from: '2025-01-17',
      to: '2025-02-17',
      projectedSessions: -3,
      recordedSessions: 0,
      recordedEntries: 0,
      complianceRate: 0,
    },
  },
}

export default {
  stubKeyworkerApiHealth,
  stubKeyworkerApiStatusIsKeyworker: () => stubKeyworkerApiStatusIsKeyworker(true),
  stubKeyworkerApiStatusIsNotKeyworker: () => stubKeyworkerApiStatusIsKeyworker(false),
  stubKeyworkerApiStatusFail: () => stubKeyworkerApiStatusFail(),
  stubKeyworkerApiStats2025,
  stubKeyworkerApiStats2024,
  stubKeyworkerApiStatsNoData,
  stubKeyworkerMembersAll,
  stubKeyworkerMembersQuery,
  stubKeyworkerMembersStatus,
  stubKeyworkerMembersNone,
  stubKeyworkerMembersError,
  stubEnabledPrisonWithHighComplexityNeedsPrisoners: () => stubKeyworkerPrisonConfig(true, true),
  stubEnabledPrison: () => stubKeyworkerPrisonConfig(true, false),
  stubPrisonNotEnabled: () => stubKeyworkerPrisonConfig(false, false),
  stubKeyworkerDetails,
  stubKeyWorkerStatsWithNullPreviousValues,
  stubKeyWorkerStatsWithNullPreviousData,
}
