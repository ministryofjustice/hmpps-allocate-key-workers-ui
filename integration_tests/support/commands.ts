import { getAPICallCountMatching, getLastAPICallMatching, getSentAuditEvents } from '../mockApis/wiremock'
import { JourneyData } from '../../server/@types/express'

type RecursivePartial<T> = T extends unknown
  ? T extends object
    ? { [K in keyof T]?: RecursivePartial<T[K]> }
    : T
  : never

export type PartialJourneyData = RecursivePartial<JourneyData>

Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.request('/key-worker')
  return cy.task<string>('getSignInUrl').then((url: string) => {
    cy.visit(url, options)
  })
})

Cypress.Commands.add('verifyLastAPICall', (matching: string | object, expected: unknown) => {
  return cy.wrap(getLastAPICallMatching(matching)).should('deep.equal', expected)
})

Cypress.Commands.add('verifyAPIWasCalled', (matching: string | object, expected: number) => {
  return cy.wrap(getAPICallCountMatching(matching)).should('eq', expected)
})

Cypress.Commands.add('injectJourneyDataAndReload', <T>(uuid: string, json: T, policy: string = 'key-worker') => {
  const data = encodeURIComponent(btoa(JSON.stringify(json)))
  cy.request('GET', `${policy}/${uuid}/inject-journey-data?data=${data}`)
  cy.reload()
})

Cypress.Commands.add('postWithCsrf', ({ url, body }) => {
  cy.get('input[name="_csrf"]')
    .should('exist')
    .then($token => {
      const requestBody = {
        _csrf: $token.val(),
        ...body,
      }

      cy.request({
        failOnStatusCode: false,
        method: 'POST',
        url,
        form: true,
        body: requestBody,
      })
    })
})

Cypress.Commands.add('verifyPostRedirectsToNotAuthorised', ({ body, url }) => {
  cy.url().then(currentUrl => {
    cy.postWithCsrf({ url: url || currentUrl, body }).then(response => {
      expect(response.status).to.equal(403)
      expect(response.redirects![0]).to.contain('/not-authorised')
    })
  })
})

Cypress.Commands.add('verifyAuditEvents', (events: object[]) => {
  return cy.wrap(getSentAuditEvents()).should('deep.equal', events)
})

Cypress.Commands.add('navigateWithHistory', (url: string, history: string[]) => {
  const historyString = btoa(JSON.stringify(history))
  const newUrl = new URL(`http://0.0.0.0${url}`)
  newUrl.searchParams.set('history', historyString)
  cy.visit(`${url.split('?')[0]}?${newUrl.searchParams.toString()}`, { failOnStatusCode: false })
})

Cypress.Commands.add('verifyHistoryLink', { prevSubject: 'element' }, (subject, urlRegex: RegExp) => {
  return cy.wrap(subject).should('have.attr', 'href').should('match', urlRegex)
})

Cypress.Commands.add('shouldContainHistoryParam', { prevSubject: 'element' }, (element, history) => {
  cy.wrap(element)
    .invoke('attr', 'href')
    .then(href => {
      const url = new URLSearchParams(href!.split('?')[1])
      const historyParam = url.get('history')

      cy.task('gzipDecompress', historyParam).then(decompressedText => {
        const actualArray = decompressedText as string
        expect(actualArray).to.deep.equal(JSON.stringify(history))
      })
    })
})

Cypress.Commands.add('visitWithHistory', (url: string, history: string[]) => {
  cy.task('gzipCompress', JSON.stringify(history)).then(b64 => {
    const searchParams = new URLSearchParams(url.split('?')[1] || '')
    searchParams.set('history', b64 as string)
    return cy.visit(`${url.split('?')[0]}?${searchParams.toString()}`, { failOnStatusCode: false })
  })
})
