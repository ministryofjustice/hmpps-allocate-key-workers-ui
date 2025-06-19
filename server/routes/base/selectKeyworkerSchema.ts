import { z } from 'zod'
import { createSchema } from '../../middleware/validationMiddleware'

const ERROR_MSG = 'Select [staffs] from the dropdown lists'

export const selectKeyworkerSchema = createSchema({
  selectStaffMember: z.union(
    [
      z.string().transform((val, ctx) => {
        if (!val?.length) {
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

export type SelectKeyworkerSchemaType = z.infer<typeof selectKeyworkerSchema>
