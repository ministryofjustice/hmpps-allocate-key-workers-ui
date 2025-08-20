import z from 'zod'
import { createSchema } from '../../../middleware/validationMiddleware'

const ERROR_MSG = 'Select which services should be active'

export const schema = createSchema({
  services: z.enum(['KW', 'PO', 'KWPO', 'NONE'], { message: ERROR_MSG }),
})

export type SchemaType = z.infer<typeof schema>
