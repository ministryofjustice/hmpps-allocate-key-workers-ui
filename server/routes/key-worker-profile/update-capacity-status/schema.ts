import { createSchema, validateNumberBetween } from '../../../middleware/validationMiddleware'
import { z } from 'zod'

export const schema = createSchema({
  capacity: validateNumberBetween('Enter a number', 'Enter a valid number', 'Number must be between 0 and 999'),
})

export type SchemaType = z.infer<typeof schema>
