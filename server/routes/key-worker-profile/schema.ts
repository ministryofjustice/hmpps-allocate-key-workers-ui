import { z } from 'zod'
import { createSchema } from '../../middleware/validationMiddleware'

const ERROR_MSG = 'Select key workers from the dropdown lists'

export const schema = createSchema({
  selectKeyworker: z.union(
    [
      z.string().transform((val, ctx) => {
        if (val?.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: ERROR_MSG,
          })
          return z.NEVER
        }
        return [val]
      }),
      z.array(z.string()).refine(val => val.some(itm => itm.length), ERROR_MSG),
    ],
    { message: ERROR_MSG },
  ),
})

export type SchemaType = z.infer<typeof schema>
