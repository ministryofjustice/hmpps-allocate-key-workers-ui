import { Request, RequestHandler, Response } from 'express'
import { z, ZodError } from 'zod'
import { FLASH_KEY__FORM_RESPONSES, FLASH_KEY__VALIDATION_ERRORS } from '../utils/constants'

export type fieldErrors = {
  [field: string | number | symbol]: string[] | undefined
}
export const buildErrorSummaryList = (array: fieldErrors) => {
  if (!array) return null
  return Object.entries(array).map(([field, error]) => ({
    text: error?.[0],
    href: `#${field}`,
  }))
}

export const findError = (errors: fieldErrors, fieldName: string) => {
  if (!errors?.[fieldName]) {
    return null
  }
  return {
    text: errors[fieldName]?.[0],
  }
}

export const customErrorOrderBuilder = (errorSummaryList: { href: string }[], order: string[]) =>
  order.map(key => errorSummaryList.find(error => error.href === `#${key}`)).filter(Boolean)

export const createSchema = <T = object>(shape: T) => zodAlwaysRefine(zObjectStrict(shape))

const zObjectStrict = <T = object>(shape: T) => z.object({ _csrf: z.string().optional(), ...shape }).strict()

/*
 * Ensure that all parts of the schema get tried and can fail before exiting schema checks - this ensures we don't have to
 * have complicated schemas if we want to both ensure the order of fields and have all the schema validation run
 * more info regarding this issue and workaround on: https://github.com/colinhacks/zod/issues/479#issuecomment-2067278879
 */
const zodAlwaysRefine = <T extends z.ZodTypeAny>(zodType: T) =>
  z.any().transform((val, ctx) => {
    const res = zodType.safeParse(val)
    if (!res.success) res.error.issues.forEach(ctx.addIssue)
    return res.data || val
  }) as unknown as T

export type SchemaFactory = (request: Request, res: Response) => Promise<z.ZodTypeAny>

const normaliseNewLines = (body: Record<string, unknown>) => {
  return Object.fromEntries(
    Object.entries(body).map(([k, v]) => [k, typeof v === 'string' ? v.replace(/\r\n/g, '\n') : v]),
  )
}

const pathArrayToString = (previous: string | number, next: string | number): string | number => {
  if (!previous) {
    return next.toString()
  }
  if (typeof next === 'number') {
    return `${previous}[${next.toString()}]`
  }
  return `${previous}.${next.toString()}`
}

export const deduplicateFieldErrors = (error: ZodError) => {
  const flattened: Record<string, Set<string>> = {}
  error.issues.forEach(issue => {
    // only field issues have a path
    if (issue.path.length > 0) {
      const path = issue.path.reduce(pathArrayToString)
      if (!flattened[path]) {
        flattened[path] = new Set([])
      }
      flattened[path]!.add(issue.message)
    }
  })
  return Object.fromEntries(Object.entries(flattened).map(([key, value]) => [key, [...value]]))
}

export const validate = (schema: z.ZodTypeAny | SchemaFactory, retainQueryString: boolean = false): RequestHandler => {
  return async (req, res, next) => {
    if (!schema) {
      return next()
    }
    const resolvedSchema = typeof schema === 'function' ? await schema(req, res) : schema
    const result = resolvedSchema.safeParse(normaliseNewLines(req.body))
    if (result.success) {
      req.body = result.data
      return next()
    }
    req.flash(FLASH_KEY__FORM_RESPONSES, JSON.stringify(req.body))

    const deduplicatedFieldErrors = deduplicateFieldErrors(result.error)

    if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'e2e-test') {
      // eslint-disable-next-line no-console
      console.error(
        `There were validation errors: ${JSON.stringify(result.error.format())} || body was: ${JSON.stringify(req.body)}`,
      )
    }
    req.flash(FLASH_KEY__VALIDATION_ERRORS, JSON.stringify(deduplicatedFieldErrors))
    // Remove any hash from the URL by appending an empty hash string)
    return res.redirect(`${retainQueryString ? req.originalUrl : req.baseUrl}#`)
  }
}

export const sanitizeSelectValue = (items: string[], value: string, defaultValue: string = ''): string => {
  if (items.includes(value)) {
    return value
  }

  return defaultValue
}

export const sanitizeQueryName = (query: string, defaultValue: string = ''): string => {
  // Only allow: letters, spaces, (smart) apostrophes, hyphens, commas, periods, numbers
  if (query.match(/^[\p{L} .',0-9’-]+$/u)) {
    return query
  }

  return defaultValue
}
