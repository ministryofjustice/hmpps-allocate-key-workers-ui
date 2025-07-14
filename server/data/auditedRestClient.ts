import { Response } from 'express'
import type { ApiConfig } from '../config'
import RestClient, { RequestWithBody, Request } from './restClient'

export default class AuditedRestClient extends RestClient {
  auditEventHandler: ((apiUrl: string, isAttempt: boolean) => void) | undefined

  constructor(name: string, config: ApiConfig, token: string, headers: { [key: string]: string } = {}, res?: Response) {
    super(name, config, token, headers)
    this.auditEventHandler = res?.sendApiEvent
  }

  override async patch<Response = unknown>(request: RequestWithBody): Promise<Response> {
    if (!this.auditEventHandler) throw new Error('Missing audit event handler for PATCH API request')
    this.auditEventHandler(`PATCH ${request.path}`, true)
    const res = (await super.patch(request)) as Response
    this.auditEventHandler(`PATCH ${request.path}`, false)
    return res
  }

  override async put<Response = unknown>(request: RequestWithBody): Promise<Response> {
    if (!this.auditEventHandler) throw new Error('Missing audit event handler for PUT API request')
    this.auditEventHandler(`PUT ${request.path}`, true)
    const res = (await super.put(request)) as Response
    this.auditEventHandler(`PUT ${request.path}`, false)
    return res
  }

  override async post<Response = unknown>(request: RequestWithBody, readOnly: boolean = false): Promise<Response> {
    if (!readOnly && !this.auditEventHandler)
      throw new Error('Missing audit event handler for non-readonly POST API request')
    if (this.auditEventHandler) this.auditEventHandler(`POST ${request.path}`, true)
    const res = (await super.post(request)) as Response
    if (this.auditEventHandler) this.auditEventHandler(`POST ${request.path}`, false)
    return res
  }

  override async delete<Response = unknown>(request: Request): Promise<Response> {
    if (!this.auditEventHandler) throw new Error('Missing audit event handler for DELETE API request')
    if (this.auditEventHandler) this.auditEventHandler(`DELETE ${request.path}`, true)
    const res = (await super.delete(request)) as Response
    if (this.auditEventHandler) this.auditEventHandler(`DELETE ${request.path}`, false)
    return res
  }
}
