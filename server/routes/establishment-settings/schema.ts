import { Request, Response } from 'express'
import { z } from 'zod'
import { createSchema } from '../../middleware/validationMiddleware'
import { validateNumberBetween } from '../../utils/validation/validateNumber'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'

export const parseFrequencyInWeeks = (val: string) => {
  switch (val) {
    case '1WK':
      return 1
    case '2WK':
      return 2
    case '3WK':
      return 3
    case '4WK':
      return 4
    default:
      return 0
  }
}

export const schemaFactory = async (_req: Request, res: Response) =>
  createSchema({
    allowAutoAllocation: z
      .enum(['TRUE', 'FALSE'], { message: 'Select if key workers can be recommended automatically' })
      .transform(val => val === 'TRUE'),
    maximumCapacity: validateNumberBetween(
      'Enter maximum number of prisoners to be allocated',
      'Enter a number between 1 and 999',
      'Enter a number between 1 and 999',
      1,
      999,
    ),
    frequencyInWeeks:
      res.locals.user.permissions >= UserPermissionLevel.ADMIN
        ? z
            .enum(['1WK', '2WK', '3WK', '4WK'], { message: 'Select how often sessions should take place' })
            .transform(parseFrequencyInWeeks)
        : z.number().optional(),
  })

export type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
