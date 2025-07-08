import { z } from 'zod'
import { createSchema } from '../../../../middleware/validationMiddleware'
import { validateNumberBetween } from '../../../../utils/validation/validateNumber'

export const schema = createSchema({
  capacity: validateNumberBetween(
    'Enter a number',
    'Enter a valid number',
    'Enter a maximum capacity between 1 and 999',
    1,
  ),
})

export type SchemaType = z.infer<typeof schema>
