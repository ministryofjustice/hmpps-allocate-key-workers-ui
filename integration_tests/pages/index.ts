import Page, { PageElement } from './page'

export default class IndexPage extends Page {
  constructor() {
    super('Key workers')
  }

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')
}
