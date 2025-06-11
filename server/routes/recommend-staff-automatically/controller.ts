import { Request, Response } from 'express'
import { ChangeStaffController } from '../base/changeKeyWorkerController'

export class RecommendStaffAutomaticallyController extends ChangeStaffController {
  GET = async (req: Request, res: Response): Promise<void> => {
    const prisonCode = res.locals.user.getActiveCaseloadId()!

    const records = await this.keyworkerApiService.searchPrisoners(req, prisonCode, {
      query: '',
      cellLocationPrefix: '',
      excludeActiveAllocations: true,
    })
    const recommendations = await this.keyworkerApiService.allocationRecommendations(req, prisonCode)
    const changeData = await this.getChangeStaffData(req, res)

    const matchedPrisoners = records.map(o => {
      const match = recommendations.allocations.find(a => a.personIdentifier === o.personIdentifier)
      return {
        ...o,
        recommendation: match?.staff.staffId,
      }
    })

    res.render('recommend-staff-automatically/view', {
      backUrl: 'allocate-staff',
      ...changeData,
      records: matchedPrisoners,
    })
  }

  POST = async (_req: Request, res: Response) => res.redirect('recommend-staff-automatically')
}
