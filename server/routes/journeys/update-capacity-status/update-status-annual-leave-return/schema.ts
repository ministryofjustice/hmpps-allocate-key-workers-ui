import { z } from 'zod'
import { createDateInputSchema, DateInputSchemaRule } from '../../../../utils/validation/dateSchema'

export const schema = createDateInputSchema({
  inputId: 'reactivateOn',
  inputDescription: 'return date',
  additionalRule: DateInputSchemaRule.MUST_BE_FUTURE,
})

export type SchemaType = z.infer<typeof schema>
