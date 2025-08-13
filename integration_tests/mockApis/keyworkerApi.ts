import { stubFor } from './wiremock'
import { components } from '../../server/@types/keyWorker'
import { StaffSummary } from '../../server/@types/express'
import { createMock } from '../../server/testutils/mockObjects'

const createBasicHttpStub = (method: string, urlPattern: string, status: number, jsonBody: object = {}) => {
  return createHttpStub(method, urlPattern, undefined, undefined, status, jsonBody)
}

const createHttpStub = (
  method: string,
  urlPathPattern: string,
  queryParameters: object | undefined,
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
    '/keyworker-api/prisons/LEI/prisoners/allocations',
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
    '/keyworker-api/prisons/LEI/prisoners/allocations',
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
  return createHttpStub('PUT', '/keyworker-api/prisons/LEI/prisoners/allocations', undefined, [], 204)
}

const stubPutAllocationFail = (code: number = 500, message?: string) => {
  return createHttpStub('PUT', '/keyworker-api/prisons/LEI/prisoners/allocations', undefined, undefined, code, {
    status: code,
    userMessage: message,
    developerMessage: message,
  })
}

const stubKeyworkerApiHealth = () => createBasicHttpStub('GET', '/keyworker-api/health/ping', 200, { status: 'UP' })

const createKeyworkerStatsStub = (from: string, to: string, jsonBody = {}) => {
  return createHttpStub(
    'GET',
    '/keyworker-api/prisons/LEI/statistics',
    { from: { matches: from }, to: { matches: to } },
    undefined,
    200,
    jsonBody,
  )
}
const stubKeyworkerPrisonConfig = (
  isEnabled: boolean,
  hasPrisonersWithHighComplexityNeeds: boolean,
  allowAutoAllocation = true,
) =>
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
        allowAutoAllocation,
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
    ...keyworkerStatisticsResponse,
    current: undefined,
    previous: undefined,
  })

const stubSearchAllocatableStaffAll = () =>
  createHttpStub(
    'POST',
    '/keyworker-api/search/prisons/LEI/staff-allocations.*',
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

const stubSearchAllocatableStaffNone = () =>
  createHttpStub(
    'POST',
    '/keyworker-api/search/prisons/LEI/staff-allocations.*',
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

const stubSearchAllocatableStaffQuery = () =>
  createHttpStub(
    'POST',
    '/keyworker-api/search/prisons/LEI/staff-allocations.*',
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

const stubSearchAllocatableStaffStatus = () =>
  createHttpStub(
    'POST',
    '/keyworker-api/search/prisons/LEI/staff-allocations.*',
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

const stubSearchAllocatableStaffStatusActive = () =>
  createHttpStub(
    'POST',
    '/keyworker-api/search/prisons/LEI/staff-allocations.*',
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

const stubKeyworkerDetails = (details: components['schemas']['StaffDetails'] = defaultKeyworkerDetails) =>
  createBasicHttpStub('GET', '/keyworker-api/prisons/LEI/staff/488095.*', 200, details)

const stubKeyworkerDetailsForStaffId = ([staffId, details]: [string, components['schemas']['StaffDetails']]) =>
  createBasicHttpStub('GET', `/keyworker-api/prisons/LEI/staff/${staffId}.*`, 200, details)

const stubKeyworkerDetailsWithoutStats = (details: components['schemas']['StaffDetails'] = defaultKeyworkerDetails) =>
  createBasicHttpStub('GET', '/keyworker-api/prisons/LEI/staff/488095.*', 200, {
    ...details,
    allocations: [],
    stats: null,
  })

const stubKeyWorkerStatsWithNullPreviousValues = () =>
  createKeyworkerStatsStub('.+', '.+', {
    ...keyworkerStatisticsResponse,
    previous: {
      from: '2025-01-11',
      to: '2025-01-11',
      highComplexityOfNeedPrisoners: 0,
      totalPrisoners: 1169,
      eligiblePrisoners: 1169,
      prisonersAssigned: 1077,
      eligibleStaff: 8,
      recordedEvents: [
        {
          type: 'SESSION',
          count: 0,
        },
        {
          type: 'ENTRY',
          count: 0,
        },
      ],
      avgReceptionToAllocationDays: null,
      avgReceptionToRecordedEventDays: null,
      projectedRecordedEvents: 167,
      percentageAssigned: null,
      recordedEventComplianceRate: 0,
    },
  })

const stubKeyWorkerStatsWithNullPreviousData = () =>
  createKeyworkerStatsStub('.+', '.+', {
    ...keyworkerStatisticsResponse,
    previous: undefined,
  })

const stubKeyworkerStatuses = () =>
  createBasicHttpStub('GET', '/keyworker-api/reference-data/staff-status', 200, keyworkerStatuses)

const stubPrisonerAllocations = (
  prisonerAllocations: components['schemas']['StaffAllocationHistory']['allocations'] = defaultPrisonerAllocations,
) =>
  createBasicHttpStub('GET', '/keyworker-api/prisoners/A9965EA/allocations', 200, { allocations: prisonerAllocations })

const stubUpsertStaffDetails = () => createBasicHttpStub('PUT', '/keyworker-api/prisons/.*/staff/.*', 200, {})

const stubAllocationRecommendations = (allocationRecommendations: components['schemas']['RecommendedAllocations']) =>
  createBasicHttpStub(
    'GET',
    '/keyworker-api/prisons/.*/prisoners/allocation-recommendations',
    200,
    allocationRecommendations,
  )

const keyworkerManageResponse = {
  content: [
    {
      staffId: 488095,
      firstName: 'AVAILABLE-ACTIVE',
      lastName: 'KEY-WORKER2',
      status: {
        code: 'ACT',
        description: 'Active',
      },
      capacity: 28,
      allocated: 32,
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
      allocated: 32,
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
      allocated: 9,
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
      allocated: 1,
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
      allocated: 0,
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
      allocated: 0,
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
    highComplexityOfNeedPrisoners: 0,
    totalPrisoners: 1172,
    eligiblePrisoners: 1172,
    prisonersAssigned: 1078,
    eligibleStaff: 11,
    recordedEvents: [
      {
        type: 'SESSION',
        count: 1,
      },
      {
        type: 'ENTRY',
        count: 0,
      },
    ],
    avgReceptionToAllocationDays: 66,
    avgReceptionToRecordedEventDays: 0,
    projectedRecordedEvents: 3851,
    percentageAssigned: 91.98,
    recordedEventComplianceRate: 0.03,
  },
  previous: {
    from: '2025-01-11',
    to: '2025-01-11',
    totalPrisoners: 1169,
    highComplexityOfNeedPrisoners: 0,
    eligiblePrisoners: 1169,
    prisonersAssigned: 1077,
    eligibleStaff: 8,
    recordedEvents: [
      {
        type: 'SESSION',
        count: 0,
      },
      {
        type: 'ENTRY',
        count: 0,
      },
    ],
    avgReceptionToAllocationDays: 0,
    avgReceptionToRecordedEventDays: 0,
    projectedRecordedEvents: 167,
    percentageAssigned: 92.13,
    recordedEventComplianceRate: 0,
  },
  hasPrisonersWithHighComplexityOfNeed: false,
} as components['schemas']['PrisonStats']

export const defaultKeyworkerDetails = {
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
    toDate: '',
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
        relevantAlertCodes: [],
        remainingAlertCount: 0,
      },
      latestSession: {
        occurredAt: '2025-01-23',
      },
      stats: {
        from: '2025-01-17',
        to: '2025-02-17',
        projectedComplianceEvents: 0,
        recordedComplianceEvents: 1,
        recordedEvents: [
          { type: 'ENTRY', count: 0 },
          { type: 'SESSION', count: 0 },
        ],
        complianceRate: 0,
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
        relevantAlertCodes: [],
        remainingAlertCount: 0,
      },
      stats: {
        from: '2025-01-17',
        to: '2025-02-17',
        projectedComplianceEvents: 0,
        recordedComplianceEvents: 0,
        recordedEvents: [
          { type: 'ENTRY', count: 0 },
          { type: 'SESSION', count: 0 },
        ],
        complianceRate: 0,
      },
    },
  ],
  stats: {
    current: {
      from: '2025-02-17',
      to: '2025-03-17',
      projectedComplianceEvents: 1,
      recordedComplianceEvents: 3,
      recordedEvents: [
        { type: 'ENTRY', count: 2 },
        { type: 'SESSION', count: 3 },
      ],
      complianceRate: 0,
    },
    previous: {
      from: '2025-01-17',
      to: '2025-02-17',
      projectedComplianceEvents: 3,
      recordedComplianceEvents: 0,
      recordedEvents: [
        { type: 'ENTRY', count: 0 },
        { type: 'SESSION', count: 0 },
      ],
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
          cellLocationPrefix: '3-',
          excludeActiveAllocations: false,
        },
      },
    ],
    200,
    { content: [keyworkerSearchPrisoners[1]] },
  )

const stubSearchPrisonersWithExcludeAllocations = (prisoners = keyworkerSearchPrisoners.slice(1)) =>
  createHttpStub(
    'POST',
    '/keyworker-api/search/prisons/.+/prisoners',
    undefined,
    [
      {
        equalToJson: {
          excludeActiveAllocations: true,
        },
      },
    ],
    200,
    { content: prisoners },
  )

const stubSearchPrisoner = (
  response: components['schemas']['PersonSearchResponse']['content'] = keyworkerSearchPrisoners,
) =>
  createHttpStub(
    'POST',
    '/keyworker-api/search/prisons/.+/prisoners',
    undefined,
    [
      {
        equalToJson: {
          query: 'ALL',
          excludeActiveAllocations: false,
        },
      },
    ],
    200,
    { content: response },
  )

const stubSearchAllocatableStaff = (results: StaffSummary[] = []) =>
  createBasicHttpStub('POST', '/keyworker-api/search/prisons/.*/staff-allocations.*', 200, {
    content: results,
  })

const stubSearchAllocatableStaffError = () =>
  createHttpStub('POST', '/keyworker-api/search/prisons/.*/staff-allocations.*', undefined, undefined, 502, {})

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
    staffMember: {
      allocationCount: 1,
      staffId: 488095,
      firstName: 'AVAILABLE-ACTIVE',
      lastName: 'KEY-WORKER',
    },
    relevantAlertCodes: ['XRF', 'RNO121'],
    remainingAlertCount: 1,
  },
  {
    personIdentifier: 'A2504EA',
    firstName: 'FOO',
    lastName: 'BAR',
    location: '3-1-027',
    hasHighComplexityOfNeeds: false,
    hasAllocationHistory: true,
    relevantAlertCodes: ['XRF', 'RNO121'],
    remainingAlertCount: 1,
  },
  {
    personIdentifier: 'G7189VT',
    firstName: 'JANE',
    lastName: 'TESTER',
    location: '4-2-031',
    hasHighComplexityOfNeeds: false,
    hasAllocationHistory: false,
    relevantAlertCodes: ['XRF', 'RNO121'],
    remainingAlertCount: 1,
  },
  {
    personIdentifier: 'AAA1234',
    firstName: 'HIGH',
    lastName: 'COMPLEXITY-NEEDS',
    location: '5-1-001',
    hasHighComplexityOfNeeds: true,
    hasAllocationHistory: false,
    relevantAlertCodes: ['XRF', 'RNO121'],
    remainingAlertCount: 1,
  },
] as components['schemas']['PersonSearchResponse']['content']

export const defaultPrisonerAllocation = {
  active: false,
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
  prison: {
    code: 'MDI',
    description: 'Moorland (HMP & YOI)',
  },
  staffMember: {
    firstName: 'Smith',
    lastName: 'Last-Name',
    staffId: 488021,
  },
}

const defaultPrisonerAllocations = [
  createMock(defaultPrisonerAllocation, {
    active: true,
    staffMember: {
      staffId: 488021,
      firstName: 'Sample',
      lastName: 'Keyworker',
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
  }),
  createMock(defaultPrisonerAllocation, { active: false }),
]

export default {
  stubKeyworkerApiHealth,
  stubKeyworkerApiStats2025,
  stubKeyworkerApiStats2024,
  stubKeyworkerApiStatsNoData,
  stubSearchAllocatableStaffAll,
  stubSearchAllocatableStaffQuery,
  stubSearchAllocatableStaffStatus,
  stubSearchAllocatableStaffNone,
  stubSearchAllocatableStaffError,
  stubEnabledPrisonWithHighComplexityNeedsPrisoners: () => stubKeyworkerPrisonConfig(true, true),
  stubEnabledPrison: (allowAutoAllocation: boolean = true) =>
    stubKeyworkerPrisonConfig(true, false, allowAutoAllocation),
  stubPrisonNotEnabled: () => stubKeyworkerPrisonConfig(false, false),
  stubKeyworkerDetails,
  stubKeyworkerDetailsWithoutStats,
  stubKeyWorkerStatsWithNullPreviousValues,
  stubKeyWorkerStatsWithNullPreviousData,
  stubKeyworkerStatuses,
  stubSearchPrisonersWithQuery,
  stubSearchPrisonersWithLocation,
  stubSearchPrisoner,
  stubSearchStaff,
  stubSearchAllocatableStaff,
  stubSearchPrisonersWithExcludeAllocations,
  stubPrisonerAllocations,
  stubSearchAllocatableStaffStatusActive,
  stubPutDeallocationSuccess,
  stubPutAllocationSuccess,
  stubPutAllocationFail500: () => stubPutAllocationFail(500),
  stubPutAllocationFail400: () => stubPutAllocationFail(400, 'Api error'),
  stubPutPrisonConfiguration,
  stubSearchStaffError,
  stubAllocationRecommendations,
  stubPutAllocationRecommendationSuccess,
  stubKeyworkerPrisonConfigNoAutoAllocation: () => stubKeyworkerPrisonConfig(true, false, false),
  stubUpsertStaffDetails,
  stubKeyworkerDetailsForStaffId,
}
