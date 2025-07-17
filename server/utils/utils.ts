import { sentenceCase } from './formatUtils'

const properCase = (word: string): string =>
  word.length >= 1 && word[0] ? word[0].toUpperCase() + word.toLowerCase().slice(1) : word

const isBlank = (str: string): boolean => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
const properCaseName = (name: string): string => (isBlank(name) ? '' : name.split('-').map(properCase).join('-'))

export const convertToTitleCase = (sentence: string | null | undefined): string =>
  !sentence || isBlank(sentence) ? '' : sentence.split(' ').map(properCaseName).join(' ')

export const initialiseName = (fullName: string | undefined | null): string | null => {
  // this check is for the authError page
  if (!fullName) return null

  const array = fullName.split(' ')
  if (array.length < 1) {
    return null
  }
  const firstName = array[0]
  if (!firstName) {
    return null
  }
  return `${firstName[0]}. ${array.reverse()[0]}`
}

export const policyAware = (text: string | Record<string, string[]>, policy: string) => {
  if (!text) return text

  if (typeof text === 'string') {
    return sentenceCase(text.replaceAll('[staff]', policy).replaceAll('[staffs]', `${policy}s`))
  }

  return Object.fromEntries(
    Object.entries(text).map(([k, v]) => [
      k,
      v.map(o => sentenceCase(o.replaceAll('[staff]', policy).replaceAll('[staffs]', `${policy}s`))),
    ]),
  )
}

// @ts-expect-error T[P] index error
export type MakeNullable<T, K extends PropertyKey> = Pick<T, Exclude<keyof T, K>> & { [P in K]?: T[P] | null }

export const getTruthyProp = (obj: Record<string, unknown>, prop: string): Record<string, unknown> => {
  if (obj[prop]) {
    return { [prop]: obj[prop] }
  }

  return {}
}
