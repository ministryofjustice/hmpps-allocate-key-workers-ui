import { z } from 'zod'
import { createSchema } from '../../../../middleware/validationMiddleware'

const ERROR_MSG = 'Select whether you want to continue automatically assigning the key worker to prisoners'

export const schema = createSchema({
  allocation: z.enum(['DEACTIVATE', 'DEACTIVATE_AND_REMOVE', 'NEITHER'], { message: ERROR_MSG }),
}).transform(val => {
  switch (val.allocation) {
    case 'DEACTIVATE':
      return { deactivateActiveAllocations: true, removeFromAutoAllocation: false }
    case 'DEACTIVATE_AND_REMOVE':
      return { deactivateActiveAllocations: true, removeFromAutoAllocation: true }
    case 'NEITHER':
    default:
      return { deactivateActiveAllocations: false, removeFromAutoAllocation: false }
  }
})

export type SchemaType = z.infer<typeof schema>
