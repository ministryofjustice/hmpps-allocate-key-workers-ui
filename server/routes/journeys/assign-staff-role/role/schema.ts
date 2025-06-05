import { z } from 'zod'
import { Request } from 'express'
import { createSchema } from '../../../../middleware/validationMiddleware'
import KeyworkerApiService from '../../../../services/keyworkerApi/keyworkerApiService'
import { validateAndTransformReferenceData } from '../../../../utils/validation/validateReferenceData'
import { getStaffRoles } from '../common/utils'

export const schemaFactory = (keyworkerApiService: KeyworkerApiService) => async (req: Request) => {
  const refDataMap = new Map(
    (await getStaffRoles(keyworkerApiService, req, 'COMMON_OPTIONS')).map(itm => [itm.code, itm]),
  )

  return createSchema({
    role: z
      .string({ required_error: 'Select a role' })
      .transform(validateAndTransformReferenceData(refDataMap, 'Select a role')),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
