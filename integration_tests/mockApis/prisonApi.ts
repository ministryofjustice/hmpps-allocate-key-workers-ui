import { stubFor } from './wiremock'

const stubPrisonApiHealth = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-api/health/ping',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: 'UP' },
    },
  })

const stubGetPrisonerImage = () => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-api/api/bookings/offenderNo/([a-zA-Z0-9]*)/image/data',
    },
    response: {
      status: 200,
      bodyFileName: 'assets/images/prisoner-profile-image.png',
      headers: {
        'Content-Type': 'image/png',
      },
    },
  })
}

const stubGetOneCaseLoad = () => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-api/api/users/me/caseLoads',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: [
        {
          currentlyActive: true,
          caseLoadId: 'LEI',
        },
      ],
    },
  })
}

const stubGetCaseloadsNoneActive = () => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-api/api/users/me/caseLoads',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: [
        {
          currentlyActive: false,
          caseLoadId: 'LEI',
        },
      ],
    },
  })
}

const stubGetCaseLoadsFail = () => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-api/api/users/me/caseLoads',
    },
    response: {
      status: 500,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: { message: 'fail' },
    },
  })
}

export default {
  stubPrisonApiHealth,
  stubGetPrisonerImage,
  stubGetOneCaseLoad,
  stubGetCaseloadsNoneActive,
  stubGetCaseLoadsFail,
}
