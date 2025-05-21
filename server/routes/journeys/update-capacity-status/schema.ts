import { z } from 'zod'
import { Request } from 'express'
import { createSchema, validateNumberBetween } from '../../../middleware/validationMiddleware'
import KeyworkerApiService from '../../../services/keyworkerApi/keyworkerApiService'

export const schemaFactory = (keyworkerApiService: KeyworkerApiService) => async (req: Request) => {
  const statuses = await keyworkerApiService.getReferenceData(req, 'keyworker-status')
  const validStatusCodes = new Set(statuses.map(status => status.code))

  return createSchema({
    capacity: validateNumberBetween('Enter a number', 'Enter a valid number', 'Number must be between 0 and 999'),
    status: z.string({ required_error: 'Select a status' }).refine(code => validStatusCodes.has(code), {
      message: 'Select a valid status',
    }),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
