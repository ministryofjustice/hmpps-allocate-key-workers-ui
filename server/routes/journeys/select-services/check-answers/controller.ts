import { NextFunction, Request, Response } from 'express'
import AllocationsApiService from '../../../../services/allocationsApi/allocationsApiService'
import { components } from '../../../../@types/keyWorker'

export class SelectServicesCheckAnswersController {
  constructor(private readonly allocationsApiService: AllocationsApiService) {}

  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true

    res.render('journeys/select-services/check-answers/view', {
      services: req.journeyData.selectServices!.services,
      keyWorkerEnabled: req.journeyData.selectServices!.keyWorkerEnabled,
      personalOfficerEnabled: req.journeyData.selectServices!.personalOfficerEnabled,
      backUrl: '../select-services',
    })
  }

  submitToApi = async (req: Request, res: Response, next: NextFunction) => {
    const { services } = req.journeyData.selectServices!

    const request: components['schemas']['PrisonPolicies'] = {
      policies: [
        {
          policy: 'KEY_WORKER',
          enabled: services === 'KW' || services === 'KWPO',
        },
        {
          policy: 'PERSONAL_OFFICER',
          enabled: services === 'PO' || services === 'KWPO',
        },
      ],
    }

    await this.allocationsApiService.putPolicies(req, res, request)
    next()
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('confirmation')
  }
}
