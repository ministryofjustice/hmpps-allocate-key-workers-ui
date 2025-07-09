import AuthorisedRoles from '../../server/authentication/authorisedRoles'
import { UserPermissionLevel } from '../../server/interfaces/hmppsUser'

export const verifyRoleBasedAccess = (url: string, minimumPermissionLevel: UserPermissionLevel) => {
  const rolesMap = {
    [UserPermissionLevel.ADMIN]: [AuthorisedRoles.OMIC_ADMIN],
    [UserPermissionLevel.ALLOCATE]: [AuthorisedRoles.KW_MIGRATION, AuthorisedRoles.PERSONAL_OFFICER_ALLOCATE],
    [UserPermissionLevel.VIEW]: [AuthorisedRoles.KEYWORKER_MONITOR, AuthorisedRoles.PERSONAL_OFFICER_VIEW],
    [UserPermissionLevel.SELF_PROFILE_ONLY]: [],
  }
  for (let i = UserPermissionLevel.SELF_PROFILE_ONLY; i <= UserPermissionLevel.ADMIN; i += 1) {
    const allow = i < minimumPermissionLevel ? 'disallow' : 'allow'
    it(`should ${allow} access to users with ${UserPermissionLevel[i]} permission level`, () => {
      const roles = rolesMap[i]

      cy.task('stubSignIn', { roles, hasAllocationJobResponsibilities: true })
      cy.signIn({ failOnStatusCode: false })
      cy.visit(url, { failOnStatusCode: false })
      cy.url().should(i < minimumPermissionLevel ? 'to.match' : 'not.to.match', /\/key-worker\/not-authorised/)
    })
  }
}
