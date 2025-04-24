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

const stubApiHealth = () => createBasicHttpStub('GET', '/locations-api/health/ping', 200, { status: 'UP' })

const stubResidentialHierarchy = () =>
  createBasicHttpStub(
    'GET',
    '/locations-api/locations/prison/.+/residential-hierarchy',
    200,
    residentialHierarchyResponse,
  )

const residentialHierarchyResponse = [
  {
    locationId: '524d6621-dcde-4e00-a212-44b31170b52d',
    locationType: 'WING',
    locationCode: '1',
    fullLocationPath: '1',
    localName: 'Houseblock 1',
    level: 1,
  },
  {
    locationId: 'b4987f7f-79fb-4f2f-9fe9-31ade8921c49',
    locationType: 'WING',
    locationCode: '2',
    fullLocationPath: '2',
    localName: 'Houseblock 2',
    level: 1,
  },
  {
    locationId: '228cd2ca-0912-4ec2-84b8-77b3daf9f165',
    locationType: 'WING',
    locationCode: '3',
    fullLocationPath: '3',
    localName: 'Houseblock 3',
    level: 1,
  },
  {
    locationId: '540d1aa3-eb8e-4de6-9a50-78ed5ed83eaf',
    locationType: 'WING',
    locationCode: '4',
    fullLocationPath: '4',
    localName: 'Houseblock 4',
    level: 1,
  },
  {
    locationId: 'c26256c4-49f7-484e-810c-b7d6a2debd89',
    locationType: 'WING',
    locationCode: '5',
    fullLocationPath: '5',
    localName: 'Houseblock 5',
    level: 1,
  },
  {
    locationId: 'a57271cf-c1ae-4c4d-82fa-9b51610505b5',
    locationType: 'WING',
    locationCode: '6',
    fullLocationPath: '6',
    localName: 'Houseblock 6',
    level: 1,
  },
  {
    locationId: '69c5a680-485e-4cc3-be38-baa72f2e0eb4',
    locationType: 'WING',
    locationCode: '7',
    fullLocationPath: '7',
    localName: 'Houseblock 7',
    level: 1,
  },
  {
    locationId: '806a3bd8-0f51-4e25-b4b9-23dc64c84ec2',
    locationType: 'WING',
    locationCode: 'S',
    fullLocationPath: 'S',
    level: 1,
  },
]

export default {
  stubApiHealth,
  stubResidentialHierarchy,
}
