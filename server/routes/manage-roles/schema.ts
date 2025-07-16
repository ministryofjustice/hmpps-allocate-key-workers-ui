import { Request, Response } from 'express'
import { z } from 'zod'
import { createSchema } from '../../middleware/validationMiddleware'

export const schemaFactory = async (_req: Request, res: Response) =>
  createSchema({
    assignOrRemove: z.enum(['ASSIGN', 'REMOVE'], {
      message: `Select if you want to assign or remove the ${res.locals.policyStaff} role`,
    }),
  })

export type SchemaType = z.infer<Awaited<ReturnType<typeof schemaFactory>>>
