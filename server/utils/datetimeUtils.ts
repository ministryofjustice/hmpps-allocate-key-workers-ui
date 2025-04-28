import { format } from 'date-fns'
import { z } from 'zod'

const DATE_FORMAT_GB = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export const DATE_FORMAT_GB_VERBOSE = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
})

const DATE_TIME_FORMAT_GB_VERBOSE = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
})

const RESULT_VALIDATOR = z.string().min(1)

const parseNumber = (value: string, min: number, max: number, length: number) => {
  const numValue = Number(value)

  if (Number.isNaN(numValue) || numValue < min || numValue > max) {
    return RESULT_VALIDATOR.safeParse(null)
  }

  return RESULT_VALIDATOR.safeParse(numValue.toString().padStart(length, '0'))
}

export const parse24Hour = (value: string) => parseNumber(value, 0, 23, 2)

export const parseMinute = (value: string) => parseNumber(value, 0, 59, 2)

export const formatDateConcise = (value?: string) => value && format(new Date(Date.parse(value)), 'd/L/yyyy')

export const formatDateLongMonthConcise = (value?: string) =>
  value && format(new Date(Date.parse(value)), 'd LLLL yyyy')

export const formatDisplayDateTime = (value?: string) =>
  value && DATE_TIME_FORMAT_GB_VERBOSE.format(new Date(Date.parse(value)))

// format HH:mm time into separate input field values HH and mm
export const formatInputTime = (value?: string | null) => {
  if (!value || value.length !== 8) {
    return [null, null]
  }
  return [value.substring(0, 2), value.substring(3, 5)]
}

export const todayString = () => new Date().toISOString().substring(0, 10)

export const todayStringGBFormat = () => DATE_FORMAT_GB.format(new Date())

export function getDateInReadableFormat(dateString: string) {
  const split = dateString?.split(/-|\//) || []
  if (split.length < 3) throw new Error(`Invalid date string: ${dateString}`)
  if (split[0]?.length === 4) {
    const date = new Date(dateString)
    return `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`
  }
  const date = new Date(parseInt(split[2]!, 10), parseInt(split[1]!, 10) - 1, parseInt(split[0]!, 10))
  return `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`
}

export const formatDateTime = (value?: string) => value && format(new Date(Date.parse(value)), 'yyyy-MM-dd HH:mm')
