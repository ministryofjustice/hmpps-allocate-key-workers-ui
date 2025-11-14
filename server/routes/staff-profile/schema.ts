import { z } from 'zod'
import { createSchema } from '../../middleware/validationMiddleware'
import { transformOptionalDate } from '../../utils/validation/validateDatePicker'

export const schema = createSchema({
  dateFrom: transformOptionalDate,
  dateTo: transformOptionalDate,
  compareDateFrom: transformOptionalDate,
  compareDateTo: transformOptionalDate,
  sort: z.string().optional(),
})

type SchemaType = z.infer<typeof schema>
export type ResQuerySchemaType = (SchemaType & { validated?: SchemaType }) | undefined
