import { stubFor } from './wiremock'
import { components } from '../../server/@types/keyWorker'
import { StaffSummary } from '../../server/@types/express'

const createBasicHttpStub = (method: string, urlPattern: string, status: number, jsonBody: object = {}) => {
  return createHttpStub(method, urlPattern, undefined, undefined, status, jsonBody)
}

const createHttpStub = (
  method: string,
  urlPathPattern: string,
  queryParameters: object,
  bodyPatterns: Array<object> | undefined,
  status: number,
  jsonBody?: object | boolean,
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

const stubPutDeallocationSuccess = () => {
  return createHttpStub(
    'PUT',
    '/keyworker-api/prisons/LEI/prisoners/keyworkers',
    undefined,
    [
      {
        equalToJson: {
          allocations: [],
          deallocations: [
            {
              personIdentifier: 'A4288DZ',
              staffId: 488095,
              deallocationReason: 'MANUAL',
            },
          ],
        },
      },
    ],
    204,
    { content: [] },
  )
}

const stubPutAllocationSuccess = () => {
  return createHttpStub(
    'PUT',
    '/keyworker-api/prisons/LEI/prisoners/keyworkers',
    undefined,
    [
      {
        equalToJson: {
          allocations: [
            {
              personIdentifier: 'A2504EA',
              staffId: 488096,
              allocationReason: 'MANUAL',
            },
            {
              personIdentifier: 'A4288DZ',
              staffId: 488096,
              allocationReason: 'MANUAL',
            },
          ],
          deallocations: [],
        },
      },
    ],
    204,
  )
}

const stubPutAllocationRecommendationSuccess = () => {
  return createHttpStub(
    'PUT',
    '/keyworker-api/prisons/LEI/prisoners/keyworkers',
    undefined,
    [
      {
        equalToJson: {
          allocations: [{ personIdentifier: 'A2504EA', staffId: 488095, allocationReason: 'AUTO' }],
          deallocations: [],
        },
      },
    ],
    204,
  )
}

const stubPutAllocationFail = (code: number = 500, message?: string) => {
  return createHttpStub('PUT', '/keyworker-api/prisons/LEI/prisoners/keyworkers', undefined, undefined, code, {
    status: code,
    userMessage: message,
    developerMessage: message,
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
      urlPathPattern: '/keyworker-api/prisons/LEI/configurations',
    },
    response: {
      status: 200,
      jsonBody: {
        isEnabled,
        hasPrisonersWithHighComplexityNeeds,
        allowAutoAllocation: true,
        capacity: 6,
        frequencyInWeeks: 1,
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
        equalToJson: {
          query: '',
          status: 'ALL',
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
          status: 'ACTIVE',
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

const stubKeyworkerMembersStatusActive = () =>
  createHttpStub(
    'POST',
    '/keyworker-api/search/prisons/LEI/keyworkers',
    undefined,
    [
      {
        equalToJson: {
          status: 'ACTIVE',
        },
      },
    ],
    200,
    { content: keyworkerManageResponse.content.filter(o => o.status.code === 'ACT') },
  )

const stubKeyworkerDetails = (details: Partial<components['schemas']['StaffDetails']> = {}) =>
  createBasicHttpStub('GET', '/keyworker-api/prisons/LEI/staff/488095', 200, {
    ...keyworkerDetailsResponse,
    ...details,
  })

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

const stubKeyworkerStatuses = () =>
  createBasicHttpStub('GET', '/keyworker-api/reference-data/staff-status', 200, keyworkerStatuses)

const stubPrisonerAllocations = () =>
  createBasicHttpStub('GET', '/keyworker-api/prisoners/A9965EA/keyworkers', 200, prisonerAllocationResponse)

const stubUpdateStaffProperties = () =>
  createBasicHttpStub('PUT', '/keyworker-api/prisons/.*/staff/.*/configuration', 200, {})

const stubAssignRoleToStaff = () =>
  createBasicHttpStub('PUT', '/keyworker-api/prisons/.*/staff/.*/job-classification', 204, {})

const stubAllocationRecommendations = () =>
  createBasicHttpStub(
    'GET',
    '/keyworker-api/prisons/.*/prisoners/allocation-recommendations',
    200,
    allocationRecommendations,
  )

const allocationRecommendations = {
  allocations: [
    {
      personIdentifier: 'A2504EA',
      location: 'COURT',
      staff: {
        staffId: 488095,
      },
    },
  ],
}

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
      firstName: 'AVAILABLE-ACTIVE2',
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
  staffId: 488095,
  firstName: 'AVAILABLE-ACTIVE',
  lastName: 'KEY-WORKER',
  staffRole: {
    position: {
      code: 'PRO',
      description: 'Prison Officer',
    },
    scheduleType: {
      code: 'FT',
      description: 'Full Time',
    },
    hoursPerWeek: 35,
    fromDate: '2024-12-18',
    toDate: null,
  },
  status: {
    code: 'ACTIVE',
    description: 'Active',
  },
  prison: {
    code: 'LEI',
    description: 'Leeds',
  },
  capacity: 6,
  allocated: 1,
  allowAutoAllocation: true,
  allocations: [
    {
      prisoner: {
        prisonNumber: 'A4288DZ',
        firstName: 'DOE',
        lastName: 'JOHN',
        csra: 'Standard',
        cellLocation: '1-1-035',
        releaseDate: '2025-02-01',
      },
      latestSession: {
        occurredAt: '2025-01-23',
      },
    },
    {
      prisoner: {
        prisonNumber: 'A2504EA',
        firstName: 'Foo',
        lastName: 'Bar',
        csra: 'Standard',
        cellLocation: '3-1-027',
        releaseDate: '2025-02-01',
      },
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
} as components['schemas']['StaffDetails']

const keyworkerStatuses = [
  {
    code: 'ACTIVE',
    description: 'Active',
  },
  {
    code: 'UNAVAILABLE_ANNUAL_LEAVE',
    description: 'Unavailable - annual leave',
  },
  {
    code: 'UNAVAILABLE_LONG_TERM_ABSENCE',
    description: 'Unavailable - long term absence',
  },
  {
    code: 'UNAVAILABLE_NO_PRISONER_CONTACT',
    description: 'Unavailable - no prisoner contact',
  },
  {
    code: 'INACTIVE',
    description: 'Inactive',
  },
]

const stubSearchPrisonersWithQuery = () =>
  createHttpStub(
    'POST',
    '/keyworker-api/search/prisons/.+/prisoners',
    undefined,
    [
      {
        equalToJson: {
          query: 'John',
          cellLocationPrefix: '',
          excludeActiveAllocations: false,
        },
      },
    ],
    200,
    { content: [keyworkerSearchPrisoners[0]] },
  )

const stubSearchPrisonersWithLocation = () =>
  createHttpStub(
    'POST',
    '/keyworker-api/search/prisons/.+/prisoners',
    undefined,
    [
      {
        equalToJson: {
          query: '',
          cellLocationPrefix: '3',
          excludeActiveAllocations: false,
        },
      },
    ],
    200,
    { content: [keyworkerSearchPrisoners[1]] },
  )

const stubSearchPrisonersWithExcludeAllocations = () =>
  createHttpStub(
    'POST',
    '/keyworker-api/search/prisons/.+/prisoners',
    undefined,
    [
      {
        equalToJson: {
          query: '',
          cellLocationPrefix: '',
          excludeActiveAllocations: true,
        },
      },
    ],
    200,
    { content: keyworkerSearchPrisoners.slice(1) },
  )

const stubSearchPrisoner = () =>
  createHttpStub(
    'POST',
    '/keyworker-api/search/prisons/.+/prisoners',
    undefined,
    [
      {
        equalToJson: {
          query: '',
          cellLocationPrefix: '',
          excludeActiveAllocations: false,
        },
      },
    ],
    200,
    { content: keyworkerSearchPrisoners },
  )

const stubSearchStaff = (results: StaffSummary[] = []) =>
  createBasicHttpStub('POST', '/keyworker-api/search/prisons/.*/staff', 200, { content: results })

const stubSearchStaffError = () =>
  createHttpStub('POST', '/keyworker-api/search/prisons/.*/staff', undefined, undefined, 502, {})

const stubPutPrisonConfiguration = () =>
  createBasicHttpStub('PUT', '/keyworker-api/prisons/LEI/configurations', 200, {})

const keyworkerSearchPrisoners = [
  {
    personIdentifier: 'A4288DZ',
    firstName: 'DOE',
    lastName: 'JOHN',
    location: '1-1-035',
    hasHighComplexityOfNeeds: false,
    hasAllocationHistory: true,
    keyworker: {
      staffId: 488095,
      firstName: 'AVAILABLE-ACTIVE',
      lastName: 'KEY-WORKER',
    },
  },
  {
    personIdentifier: 'A2504EA',
    firstName: 'FOO',
    lastName: 'BAR',
    location: '3-1-027',
    hasHighComplexityOfNeeds: false,
    hasAllocationHistory: true,
  },
  {
    personIdentifier: 'G7189VT',
    firstName: 'JANE',
    lastName: 'TESTER',
    location: '4-2-031',
    hasHighComplexityOfNeeds: false,
    hasAllocationHistory: false,
  },
]

const prisonerAllocationResponse = {
  allocations: [
    {
      active: true,
      keyworker: {
        staffId: 488021,
        firstName: 'Sample',
        lastName: 'Keyworker',
      },
      prison: {
        code: 'MDI',
        description: 'Moorland (HMP & YOI)',
      },
      allocated: {
        at: '2025-04-17T14:41:23.931574',
        by: 'Test Keyworker',
        reason: {
          code: 'AUTO',
          description: 'Automatic',
        },
      },
      deallocated: null,
    },
    {
      active: false,
      keyworker: {
        staffId: 488021,
        firstName: 'Smith',
        lastName: 'Last-Name',
      },
      prison: {
        code: 'MDI',
        description: 'Moorland (HMP & YOI)',
      },
      allocated: {
        at: '2024-12-18T10:56:37.073945',
        by: 'Foo Baz',
        reason: {
          code: 'MANUAL',
          description: 'Manual',
        },
      },
      deallocated: {
        at: '2025-02-12T15:57:56.862492',
        by: 'Fake Doe',
        reason: {
          code: 'MANUAL',
          description: 'Manual',
        },
      },
    },
  ],
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
  stubKeyworkerStatuses,
  stubSearchPrisonersWithQuery,
  stubSearchPrisonersWithLocation,
  stubSearchPrisoner,
  stubSearchStaff,
  stubSearchPrisonersWithExcludeAllocations,
  stubPrisonerAllocations,
  stubKeyworkerMembersStatusActive,
  stubPutDeallocationSuccess,
  stubPutAllocationSuccess,
  stubPutAllocationFail500: () => stubPutAllocationFail(500),
  stubPutAllocationFail400: () => stubPutAllocationFail(400, 'Api error'),
  stubUpdateStaffProperties,
  stubPutPrisonConfiguration,
  stubSearchStaffError,
  stubAllocationRecommendations,
  stubPutAllocationRecommendationSuccess,
  stubAssignRoleToStaff,
}
