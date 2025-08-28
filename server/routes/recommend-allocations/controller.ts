import { Request, Response } from 'express'
import { ChangeStaffController } from '../base/changeStaffController'
import {
  AllocateResult,
  AllocateResultType,
  FLASH_KEY__ALLOCATE_RESULT,
  FLASH_KEY__API_ERROR,
  FLASH_KEY__COUNT,
} from '../../utils/constants'
import { lastNameCommaFirstName } from '../../utils/formatUtils'
import { Page } from '../../services/auditService'

export class RecommendStaffAutomaticallyController extends ChangeStaffController {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { allowPartialAllocation } = req.query

    const prisonCode = res.locals.user.getActiveCaseloadId()!

    const recommendations = await this.allocationsApiService.allocationRecommendations(req, prisonCode)

    if (!recommendations.allocations.length && !recommendations.noAvailableStaffFor?.length) {
      return res.render('recommend-allocations/view', {
        showBreadcrumbs: true,
        records: [],
        count: req.flash(FLASH_KEY__COUNT)[0],
        apiError: req.flash(FLASH_KEY__API_ERROR)[0],
      })
    }

    if (recommendations.allocations.length === 0 && recommendations.noAvailableStaffFor?.length) {
      req.flash(
        FLASH_KEY__ALLOCATE_RESULT,
        JSON.stringify({
          type: AllocateResultType.NO_CAPACITY_FOR_AUTO_ALLOCATION,
        } as AllocateResult),
      )
      return res.redirect(req.headers.referer ?? `/${res.locals.policyPath}/allocate`)
    }

    const records = (
      await this.allocationsApiService.searchPrisoners(req, prisonCode, {
        query: '',
        cellLocationPrefix: '',
        excludeActiveAllocations: true,
      })
    ).filter(o => !o.hasHighComplexityOfNeeds)

    const missingAllocation = allowPartialAllocation
      ? null
      : records.filter(
          prisoner => !recommendations.allocations.find(match => prisoner.personIdentifier === match.personIdentifier),
        ).length

    if (missingAllocation) {
      const searchQuery = req.url.split('?')[1] || ''
      return res.render('recommend-allocations/not-enough-available-capacity/view', {
        goBackUrl:
          res.locals.breadcrumbs.fromAlias(Page.ALLOCATE)?.href ||
          req.headers?.['referer'] ||
          `/${res.locals.policyPath || ''}`,
        showBreadcrumbs: true,
        missingAllocation,
        searchQuery,
        totalPrisoners: records.length,
      })
    }

    const dropdownOptions = this.getDropdownOptions(recommendations.staff)

    const matchedPrisoners = records.map(o => {
      const match = recommendations.allocations.find(a => a.personIdentifier === o.personIdentifier)

      if (match) {
        dropdownOptions.push({
          text: `${lastNameCommaFirstName(match.staff)} (allocations: ${match.staff.allocated})`,
          value: `allocate:${match.staff.staffId}:auto`,
          onlyFor: o.personIdentifier,
        })
      }

      return {
        ...o,
        recommendation: match?.staff.staffId,
        kwDropdown: dropdownOptions.filter(x => !x.onlyFor || x.onlyFor === o.personIdentifier),
        recommendedText: match
          ? `${lastNameCommaFirstName(match!.staff)} (allocations: ${match!.staff.allocated})`
          : '',
      }
    })

    return res.render('recommend-allocations/view', {
      showBreadcrumbs: true,
      records: matchedPrisoners,
      staff: dropdownOptions,
      count: req.flash(FLASH_KEY__COUNT)[0],
      apiError: req.flash(FLASH_KEY__API_ERROR)[0],
      jsEnabled: req.query['js'] === 'true',
    })
  }

  POST = async (_req: Request, res: Response) => res.redirect('allocate')
}
