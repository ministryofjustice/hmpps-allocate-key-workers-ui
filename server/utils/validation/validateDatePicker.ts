import { z } from 'zod'
import { isAfter, isBefore, isEqual, isValid, parseISO } from 'date-fns'

const validateDateBase = (requiredErr: string, invalidErr: string) => {
  return z
    .string({ message: requiredErr })
    .min(1, { message: requiredErr })
    .transform(value => value.split(/[-/]/).reverse())
    .transform(value => {
      // Prefix month and date with a 0 if needed
      const month = value[1]?.length === 2 ? value[1] : `0${value[1]}`
      const date = value[2]?.length === 2 ? value[2] : `0${value[2]}`
      return `${value[0]}-${month}-${date}T00:00:00Z` // We put a full timestamp on it so it gets parsed as UTC time and the date doesn't get changed due to locale
    })
    .transform(date => parseISO(date))
    .check(ctx => {
      if (!isValid(ctx.value)) {
        ctx.issues.push({ code: 'custom', message: invalidErr, input: ctx.value })
      }
    })
}

export const validateTransformPastDate = (requiredErr: string, invalidErr: string, maxErr: string) => {
  return validateDateBase(requiredErr, invalidErr)
    .check(ctx => {
      const date = ctx.value
      if (!isBefore(date, new Date())) {
        ctx.issues.push({ code: 'custom', message: maxErr, input: ctx.value })
      }
    })
    .transform(date => date.toISOString().substring(0, 10))
}

export const validateTransformFutureDate = (requiredErr: string, invalidErr: string, maxErr: string) => {
  return validateDateBase(requiredErr, invalidErr)
    .check(ctx => {
      const today = new Date()
      today.setHours(0)
      today.setMinutes(0)
      today.setSeconds(0)
      today.setMilliseconds(0)
      if (!isAfter(ctx.value, today) && !isEqual(ctx.value, today)) {
        ctx.issues.push({ code: 'custom', message: maxErr, input: ctx.value })
      }
    })
    .transform(date => date.toISOString().substring(0, 10))
}
