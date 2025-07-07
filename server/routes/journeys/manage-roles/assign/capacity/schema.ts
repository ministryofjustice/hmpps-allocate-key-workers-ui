import { z } from 'zod'
import { createSchema } from '../../../../../middleware/validationMiddleware'
import { validateNumberBetween } from '../../../../../utils/validation/validateNumber'

export const schema = createSchema({
  capacity: validateNumberBetween(
    'Enter a number for this prison officer’s capacity',
    'Enter a valid number for this prison officer’s capacity',
    'Enter a number between 1 and 999',
    1,
  ),
})

export type SchemaType = z.infer<typeof schema>
