import { z } from 'zod'
import { Request } from 'express'
import { createSchema } from '../../../../middleware/validationMiddleware'
import AllocationsApiService from '../../../../services/allocationsApi/allocationsApiService'
import { validateAndTransformReferenceData } from '../../../../utils/validation/validateReferenceData'

export const schemaFactory = (allocationsApiService: AllocationsApiService) => async (req: Request) => {
  const refDataMap = new Map(
    (await allocationsApiService.getReferenceData(req, 'staff-status')).map(itm => [itm.code, itm]),
  )

  return createSchema({
    status: z
      .string({ error: 'Select a status' })
      .transform(validateAndTransformReferenceData(refDataMap, 'Select a valid status')),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
