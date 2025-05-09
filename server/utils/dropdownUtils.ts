interface SelectOption {
  text: string
  value: string | number
  selected?: boolean
  attributes?: Record<string, string>
}

export const addSelectValue = (
  items: SelectOption[] | null,
  text: string,
  show: boolean = true,
  value: string = '',
  selected: boolean = true,
): SelectOption[] | null => {
  if (!items) return null
  const attributes: Record<string, string> = {}
  if (!show) attributes['hidden'] = ''

  return [
    {
      text,
      value,
      selected,
      attributes,
    },
    ...items,
  ]
}

export const setSelectedValue = (items: SelectOption[] | null, selected: string | number): SelectOption[] | null => {
  if (!items) return null
  return items.map(entry => ({
    ...entry,
    selected: entry && entry.value === selected,
  }))
}

export const excludeCurrentKeyworker = (
  items: SelectOption[],
  currentKeyworker: { staffId: string } | null,
): SelectOption[] => {
  if (!currentKeyworker || !items) return items
  return items.filter(o => !o.value.toString().endsWith(`:${currentKeyworker.staffId}`))
}

export const excludeDeallocate = (items: SelectOption[]): SelectOption[] => {
  return items.filter(o => !o.value.toString().endsWith('deallocate'))
}

export const mergePrisonerKeyworkerIds = (items: SelectOption[], prisonerId: string): SelectOption[] => {
  return items.map(o => ({ ...o, value: `${prisonerId}:${o.value}` }))
}
