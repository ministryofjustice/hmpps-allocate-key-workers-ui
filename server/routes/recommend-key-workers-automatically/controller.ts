import { Request, Response } from 'express'
import { ChangeKeyWorkerController } from '../base/changeKeyWorkerController'

export class RecommendKeyWorkersAutomaticallyController extends ChangeKeyWorkerController {
  GET = async (req: Request, res: Response): Promise<void> => {
    const prisonCode = res.locals.user.getActiveCaseloadId()!

    const records = await this.keyworkerApiService.searchPrisoners(req, prisonCode, { excludeActiveAllocations: true })
    const recommendations = await this.keyworkerApiService.allocationRecommendations(req, prisonCode)
    const changeData = await this.getChangeKeyworkerData(req, res)

    const matchedPrisoners = records.map(o => {
      const match = recommendations.allocations.find(a => a.personIdentifier === o.personIdentifier)
      // if (!match) {
      //   debugger
      // }
      return {
        ...o,
        recommendation: match?.staff.staffId,
      }
    })

    res.render('recommend-key-workers-automatically/view', {
      ...changeData,
      records: matchedPrisoners,
      showBreadcrumbs: true,
    })
  }

  POST = async (req: Request, res: Response) => res.redirect(req.get('Referrer')!)

  filter = async (req: Request, res: Response): Promise<void> => {
    const params = new URLSearchParams({
      query: req.body.query || '',
      cellLocationPrefix: req.body.cellLocationPrefix || '',
      excludeActiveAllocations: req.body.excludeActiveAllocations || false,
    })
    return res.redirect(`/allocate-key-workers?${params.toString()}`)
  }
}
