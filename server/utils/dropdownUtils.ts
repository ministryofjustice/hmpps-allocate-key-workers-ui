interface SelectOption {
  text: string
  value: string | number
  selected?: boolean
  attributes?: Record<string, string>
}

export const addDefaultSelectedValue = (
  items: SelectOption[] | null,
  text: string,
  show: boolean,
): SelectOption[] | null => {
  if (!items) return null
  const attributes: Record<string, string> = {}
  if (!show) attributes['hidden'] = ''

  return [
    {
      text,
      value: '',
      selected: true,
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

export const excludeCurrentKeyworker = (items: SelectOption[], currentKeyworker: string): SelectOption[] => {
  if (!currentKeyworker || !items) return items
  return items.filter(o => !o.text.toString().startsWith(currentKeyworker))
}
