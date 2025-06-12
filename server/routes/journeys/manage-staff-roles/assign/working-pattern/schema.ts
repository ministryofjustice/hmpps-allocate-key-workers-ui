import { z } from 'zod'
import { createSchema } from '../../../../../middleware/validationMiddleware'

const ERROR_MSG = 'Select a working pattern'

export const schema = createSchema({
  workingPattern: z.enum(['FULL_TIME', 'PART_TIME'], { message: ERROR_MSG }).transform(val => {
    switch (val) {
      case 'FULL_TIME':
        return 35
      case 'PART_TIME':
        return 6
      default:
        return 0
    }
  }),
})

export type SchemaType = z.infer<typeof schema>
