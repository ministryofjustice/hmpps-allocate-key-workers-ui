import jwt from 'jsonwebtoken'
import type { Response } from 'superagent'

import { stubFor, getMatchingRequests } from './wiremock'
import tokenVerification from './tokenVerification'
import AuthorisedRoles from '../../server/authentication/authorisedRoles'

interface UserToken {
  name?: string
  roles?: string[]
  user_id?: string
}

const createToken = (userToken: UserToken) => {
  // authorities in the session are always prefixed by ROLE.
  const authorities = userToken.roles?.map(role => (role.startsWith('ROLE_') ? role : `ROLE_${role}`)) || []
  const payload = {
    name: userToken.name || 'john smith',
    user_name: 'USER1',
    scope: ['read'],
    auth_source: 'nomis',
    authorities,
    jti: '83b50a10-cca6-41db-985f-e87efb303ddb',
    client_id: 'clientid',
    user_id: userToken.user_id,
  }

  return jwt.sign(payload, 'secret', { expiresIn: '1h' })
}

const getSignInUrl = (): Promise<string> =>
  getMatchingRequests({
    method: 'GET',
    urlPath: '/auth/oauth/authorize',
  }).then(data => {
    const { requests } = data.body
    const stateValue = requests[requests.length - 1].queryParams.state.values[0]
    return `/sign-in/callback?code=codexxxx&state=${stateValue}`
  })

const favicon = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/favicon.ico',
    },
    response: {
      status: 200,
    },
  })

const ping = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/health/ping',
    },
    response: {
      status: 200,
    },
  })

const redirect = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/oauth/authorize\\?response_type=code&redirect_uri=.+?&state=.+?&client_id=clientid',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        Location: 'http://localhost:3007/sign-in/callback?code=codexxxx&state=stateyyyy',
      },
      body: '<html><body>Sign in page<h1>Sign in</h1></body></html>',
    },
  })

const signOut = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/sign-out.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: '<html><body>Sign in page<h1>Sign in</h1></body></html>',
    },
  })

const manageDetails = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/account-details.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: '<html><body><h1>Your account details</h1></body></html>',
    },
  })

const token = (userToken: UserToken) =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/auth/oauth/token',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        Location: 'http://localhost:3007/sign-in/callback?code=codexxxx&state=stateyyyy',
      },
      jsonBody: {
        access_token: createToken(userToken),
        auth_source: 'nomis',
        token_type: 'bearer',
        user_name: 'USER1',
        expires_in: 599,
        scope: 'read',
        internalUser: true,
      },
    },
  })

const stubGetCaseLoads = () => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-api/api/users/me/caseLoads\\?allCaseloads=true',
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
          description: 'Leeds (HMP)',
        },
        {
          currentlyActive: false,
          caseLoadId: 'MDI',
          description: 'Moorland',
        },
      ],
    },
  })
}

const stubAllocationJobResponsibilities = (hasAllocationJobResponsibilities: boolean) => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/keyworker-api/prisons/.*/staff/.*/job-classifications',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        policies: hasAllocationJobResponsibilities ? ['KEY_WORKER', 'PERSONAL_OFFICER'] : [],
      },
    },
  })
}

const stubAuditSqs = () =>
  stubFor({
    request: {
      method: 'POST',
      url: '/',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
      body: '{ }',
    },
  })

export default {
  getSignInUrl,
  stubAuthPing: ping,
  stubAuthManageDetails: manageDetails,
  stubSignIn: (
    userToken: UserToken & { hasAllocationJobResponsibilities?: boolean } = {
      roles: [AuthorisedRoles.OMIC_ADMIN],
      hasAllocationJobResponsibilities: true,
    },
  ): Promise<[Response, Response, Response, Response, Response, Response, Response, Response]> =>
    Promise.all([
      favicon(),
      redirect(),
      signOut(),
      token(userToken),
      tokenVerification.stubVerifyToken(),
      stubGetCaseLoads(),
      stubAllocationJobResponsibilities(userToken.hasAllocationJobResponsibilities),
      stubAuditSqs(),
    ]),
}
