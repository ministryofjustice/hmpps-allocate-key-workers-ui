import { z } from 'zod'
import { createSchema, validateNumberBetween } from '../../../middleware/validationMiddleware'

export const schema = createSchema({
  capacity: validateNumberBetween('Enter a number', 'Enter a valid number', 'Number must be between 0 and 999'),
  status: z.string().optional(),
})

export type SchemaType = z.infer<typeof schema>
