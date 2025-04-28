const uniformWhitespace = (word: string): string => (word ? word.trim().replace(/\s+/g, ' ') : '')

export const sentenceCase = (word: string): string => {
  const uniformWhitespaceWord = uniformWhitespace(word)
  return uniformWhitespaceWord.trim().length >= 1
    ? uniformWhitespaceWord[0]!.toUpperCase() + uniformWhitespaceWord.toLowerCase().slice(1)
    : ''
}

export const nameCase = (name: string): string => {
  const uniformWhitespaceName = uniformWhitespace(name)
  return uniformWhitespaceName
    .split(' ')
    .map(s => (s.includes('-') ? s.split('-').map(sentenceCase).join('-') : sentenceCase(s)))
    .join(' ')
}

export const lastNameCommaFirstName = (person: { firstName: string; lastName: string }): string => {
  if (!person) return ''
  return `${nameCase(person.lastName)}, ${nameCase(person.firstName)}`.replace(/(^, )|(, $)/, '')
}

export const firstNameSpaceLastName = (person: { firstName: string; lastName: string }): string => {
  if (!person) return ''
  return `${nameCase(person.firstName)} ${nameCase(person.lastName)}`.trim()
}
