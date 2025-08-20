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

    const recommendations = await this.keyworkerApiService.allocationRecommendations(req, prisonCode)

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
      await this.keyworkerApiService.searchPrisoners(req, prisonCode, {
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

    const matchedPrisoners = records.map(o => {
      const match = recommendations.allocations.find(a => a.personIdentifier === o.personIdentifier)
      const staff = [...recommendations.staff]

      if (match && !recommendations.staff.find(s => s.staffId === match.staff.staffId)) {
        staff.push(match.staff)
      }

      return {
        ...o,
        recommendation: match?.staff.staffId,
        recommendedText: match
          ? `${lastNameCommaFirstName(match!.staff)} (allocations: ${match!.staff.allocated})`
          : '',
      }
    })

    const dropdownOptions = this.getDropdownOptions(recommendations.staff)

    return res.render('recommend-allocations/view', {
      showBreadcrumbs: true,
      records: matchedPrisoners,
      staff: dropdownOptions,
      longestOption: dropdownOptions.reduce((acc, obj) => (acc.length > obj.text.length ? acc : obj.text), ''),
      count: req.flash(FLASH_KEY__COUNT)[0],
      apiError: req.flash(FLASH_KEY__API_ERROR)[0],
    })
  }

  POST = async (_req: Request, res: Response) => res.redirect('allocate')
}
