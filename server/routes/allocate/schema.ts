import { z } from 'zod'
import { createSchema } from '../../middleware/validationMiddleware'

export const schema = createSchema({
  query: z.string().optional(),
  cellLocationPrefix: z.string().optional(),
  excludeActiveAllocations: z.boolean().optional(),
}).refine(obj => obj.query || obj.cellLocationPrefix || obj.excludeActiveAllocations, {
  message: 'At least one filter must be applied',
  path: ['query'],
})

type SchemaType = z.infer<typeof schema>
export type ResQuerySchemaType = (SchemaType & { validated?: SchemaType }) | undefined
