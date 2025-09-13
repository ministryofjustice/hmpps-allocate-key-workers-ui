import { Request, Response } from 'express'
import AllocationsApiService from '../../../services/allocationsApi/allocationsApiService'
import { SchemaType } from './schema'

export class SelectServicesController {
  constructor(private readonly allocationsApiService: AllocationsApiService) {}

  GET = async (req: Request, res: Response) => {
    if (!req.journeyData.selectServices) {
      const policies = await this.allocationsApiService.getPolicies(req, res.locals.user.getActiveCaseloadId()!)
      req.journeyData.selectServices = {
        keyWorkerEnabled: !!policies.policies.find(({ enabled, policy }) => enabled && policy === 'KEY_WORKER'),
        personalOfficerEnabled: !!policies.policies.find(
          ({ enabled, policy }) => enabled && policy === 'PERSONAL_OFFICER',
        ),
      }
    }

    res.render('journeys/select-services/view', {
      backUrl: `/${res.locals.policyPath}/establishment-settings`,
      services: req.journeyData.selectServices!.services,
      keyWorkerEnabled: req.journeyData.selectServices!.keyWorkerEnabled,
      personalOfficerEnabled: req.journeyData.selectServices!.personalOfficerEnabled,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.selectServices!.services = req.body.services
    res.redirect('select-services/check-answers')
  }
}
