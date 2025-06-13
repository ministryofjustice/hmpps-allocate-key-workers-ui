import { z } from 'zod'
import { createSchema } from '../../../../../middleware/validationMiddleware'
import { validateAndTransformReferenceData } from '../../../../../utils/validation/validateReferenceData'

const ERROR_MSG = 'Select a working pattern'

const refDataMap = new Map([
  [
    'FT',
    {
      code: 'FT',
      description: 'Full-time',
      hoursPerWeek: 35,
    },
  ],
  [
    'PT',
    {
      code: 'PT',
      description: 'Part-time',
      hoursPerWeek: 6,
    },
  ],
])

export const schema = createSchema({
  scheduleType: z
    .string({ required_error: ERROR_MSG })
    .transform(validateAndTransformReferenceData(refDataMap, ERROR_MSG)),
})

export type SchemaType = z.infer<typeof schema>
