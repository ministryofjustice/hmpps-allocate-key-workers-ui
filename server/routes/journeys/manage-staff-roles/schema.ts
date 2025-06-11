import { z } from 'zod'
import { createSchema } from '../../../middleware/validationMiddleware'

const ERROR_MSG = 'Enter a name, work email address or username'

export const schema = createSchema({
  query: z.string({ message: ERROR_MSG }).refine(val => val && val.trim().length > 0, ERROR_MSG),
})

export type SchemaType = z.infer<typeof schema>
