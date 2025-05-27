import { z, RefinementCtx } from 'zod'

export const validateAndTransformReferenceData =
  <T>(refDataMap: Map<string, T>, errorMessage: string) =>
  (val: string, ctx: RefinementCtx) => {
    if (!refDataMap.has(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: errorMessage,
      })
      return z.NEVER
    }
    return refDataMap.get(val)!
  }
