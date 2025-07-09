import { z } from 'zod'
import { createSchema } from '../../../../middleware/validationMiddleware'

const ERROR_MSG = 'Select if you want to deallocate their current prisoners'

export const schema = createSchema({
  deactivateActiveAllocations: z
    .enum(['REMOVE', 'DO_NOT_REMOVE'], { message: ERROR_MSG })
    .transform(val => val === 'REMOVE'),
})

export type SchemaType = z.infer<typeof schema>
