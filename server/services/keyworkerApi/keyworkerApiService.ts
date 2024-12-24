import { Request } from 'express'
import { RestClientBuilder } from '../../data'
import KeyworkerApiClient, { ServiceConfigInfo } from './keyworkerApiClient'

export default class KeyworkerApiService {
  constructor(private readonly keyworkerApiClientBuilder: RestClientBuilder<KeyworkerApiClient>) {}

  getServiceConfigInfo(req: Request): Promise<ServiceConfigInfo> {
    return this.keyworkerApiClientBuilder(req.systemClientToken).getServiceConfigInfo()
  }
}
