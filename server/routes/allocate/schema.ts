import { z } from 'zod'
import { createSchema } from '../../middleware/validationMiddleware'
import { components } from '../../@types/locationsInsidePrison'

export const schemaFactory = (locations: components['schemas']['PrisonHierarchyDto'][]) =>
  createSchema({
    query: z
      .string()
      .regex(/^[\p{L} .',0-9’-]*$/u, 'Enter a valid name or prison number')
      .optional(),
    cellLocationPrefix: z
      .string()
      .optional()
      .transform((o, ctx) => {
        if (!o || locations.find(l => l.fullLocationPath === o)) {
          return o!
        }
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Select a valid location',
        })
        return z.NEVER
      }),
    excludeActiveAllocations: z.boolean().optional(),
  }).refine(obj => obj.query || obj.cellLocationPrefix || obj.excludeActiveAllocations, {
    message: 'Select or enter text into at least one of the search options below',
    path: ['searchBy'],
  })

type SchemaType = z.infer<ReturnType<typeof schemaFactory>>
export type ResQuerySchemaType = (SchemaType & { validated?: SchemaType }) | undefined
