import { z } from 'zod'
import { createSchema } from '../../middleware/validationMiddleware'
import { validateTransformPastDate } from '../../utils/validation/validateDatePicker'

export const schema = createSchema({
  dateFrom: validateTransformPastDate(
    'Enter a date',
    'From date must be a real date',
    'Date must be today or in the past',
  ),
  dateTo: validateTransformPastDate('Enter a date', 'To date must be a real date', 'Date must be today or in the past'),
})

type SchemaType = z.infer<typeof schema>
export type ResQuerySchemaType = (SchemaType & { validated?: SchemaType }) | undefined
