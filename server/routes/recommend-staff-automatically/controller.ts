import { Request, Response } from 'express'
import { ChangeStaffController } from '../base/changeStaffController'
import { FLASH_KEY__API_ERROR, FLASH_KEY__COUNT } from '../../utils/constants'
import { lastNameCommaFirstName } from '../../utils/formatUtils'

export class RecommendStaffAutomaticallyController extends ChangeStaffController {
  GET = async (req: Request, res: Response): Promise<void> => {
    const prisonCode = res.locals.user.getActiveCaseloadId()!

    const records = await this.keyworkerApiService.searchPrisoners(req, prisonCode, {
      query: '',
      cellLocationPrefix: '',
      excludeActiveAllocations: true,
    })
    const recommendations = await this.keyworkerApiService.allocationRecommendations(req, prisonCode)

    const matchedPrisoners = records.map(o => {
      const match = recommendations.allocations.find(a => a.personIdentifier === o.personIdentifier)
      const staff = [...recommendations.staff]

      if (match && !recommendations.staff.find(s => s.staffId === match.staff.staffId)) {
        staff.push(match.staff)
      }

      return {
        ...o,
        recommendation: match?.staff.staffId,
        kwDropdown: staff
          .sort((a, b) => (a.allocated > b.allocated ? 1 : -1))
          .map(s => {
            return {
              text: `${lastNameCommaFirstName(s)} (allocations: ${s.allocated})`,
              value: `allocate:${s.staffId}${s.staffId === match?.staff.staffId ? ':auto' : ''}`,
            }
          }),
      }
    })

    res.render('recommend-staff-automatically/view', {
      backUrl: 'allocate-staff',
      records: matchedPrisoners,
      count: req.flash(FLASH_KEY__COUNT)[0],
      apiError: req.flash(FLASH_KEY__API_ERROR)[0],
    })
  }

  POST = async (_req: Request, res: Response) => res.redirect('recommend-staff-automatically')
}
