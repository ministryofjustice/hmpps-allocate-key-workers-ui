import { z } from 'zod'

export const validateNumberBetween = (
  requiredErr: string,
  invalidErr: string,
  rangeErr: string,
  min: number = 0,
  max: number = 999,
) => {
  // Validate that the input is a number and between 0-999
  return z
    .string({ required_error: requiredErr })
    .min(1, { message: requiredErr })
    .refine(val => /^\d+$/.test(val), { message: invalidErr })
    .transform(Number)
    .refine(val => val >= min && val <= max, { message: rangeErr })
}
