import { z } from 'zod'
import { createSchema } from '../../../../../middleware/validationMiddleware'

const ERROR_MSG = 'Select if this individual is a prison officer'

export const schema = createSchema({
  isPrisonOfficer: z.enum(['YES', 'NO'], { message: ERROR_MSG }),
})

export type SchemaType = z.infer<typeof schema>
