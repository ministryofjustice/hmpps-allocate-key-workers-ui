import { Request, Response } from 'express'
import KeyworkerApiService from '../../services/keyworkerApi/keyworkerApiService'

export class PrisonerAllocationHistoryController {
  constructor(private readonly keyworkerApiService: KeyworkerApiService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const prisoner = req.middleware!.prisonerData!
    const staffAllocations = await this.keyworkerApiService.getStaffAllocations(req, prisoner.prisonerNumber)

    const searchParams = new URLSearchParams(req.query as Record<string, string>).toString()

    res.render('prisoner-allocation-history/view', {
      prisoner,
      allocationHistory: staffAllocations.allocations,
      backUrl: `/${res.locals.policyPath}/allocate${searchParams.length > 0 ? `?${searchParams}` : ''}`,
    })
  }
}
