import IndexPage from '../pages/index'
import AuthSignInPage from '../pages/authSignIn'
import Page from '../pages/page'

context('Sign In', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubEnabledPrison')
  })

  it('Unauthenticated user directed to auth', () => {
    cy.visit('/')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Unauthenticated user navigating to sign in page directed to auth', () => {
    cy.visit('/sign-in')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('User name visible in header', () => {
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.headerUserName().should('contain.text', 'J. Smith')
  })

  it('User can sign out', () => {
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.signOut().click()
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Token verification failure takes user to sign in page', () => {
    cy.signIn()
    Page.verifyOnPage(IndexPage)
    cy.task('stubVerifyToken', false)

    cy.visit('/')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Token verification failure clears user session', () => {
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    cy.task('stubVerifyToken', false)

    cy.visit('/')
    Page.verifyOnPage(AuthSignInPage)

    cy.task('stubVerifyToken', true)
    cy.task('stubSignIn', { name: 'bobby brown' })

    cy.signIn({ failOnStatusCode: false })

    indexPage.headerUserName().contains('B. Brown')
  })
})
