export const formatNumber = (value: string | number, type?: string): number => {
  if (type === 'percentage') return Number(parseFloat(value.toString()).toFixed(2))
  return Number(value)
}

export const formatValue = (value?: number | null, type: string = 'number'): string | number => {
  if (type === 'incomplete') return 'Incomplete data'

  if (value === undefined || value === null) return '-'

  if (type === 'percentage') {
    const roundedValue = value !== 0 ? value.toFixed(2) : 0
    return `${roundedValue} %`
  }
  if (type === 'day') return `${value} day${value === 1 ? '' : 's'}`
  return value
}

export const formatChange = (change: number, type: string = 'number'): string | number => {
  const formatted = formatValue(change, type)
  if (change > 0) return `+${formatted} increase`
  if (change < 0) return `${formatted} decrease`
  if (change === 0) return 'No change'
  return formatted
}

export function getStatChange(current?: number, previous?: number, type: string = 'number') {
  return formatChange((current || 0) - (previous || 0), type)
}

export const formatChangeWithHighlight = (
  change: number,
  inverseStat: boolean,
  type: string = 'number',
): string | number => {
  const formatted = formatValue(change, type)
  let className = ''
  let formattedValue = ''
  let changeType = ''

  if (change > 0) {
    className = inverseStat ? 'stat-change--decrease' : 'stat-change--increase'
    formattedValue = `+${formatted}`
    changeType = 'increase'
  } else if (change < 0) {
    className = inverseStat ? 'stat-change--increase' : 'stat-change--decrease'
    formattedValue = `${formatted}`
    changeType = 'decrease'
  } else {
    return 'No change'
  }

  if (className) {
    return `<span class="${className}">${formattedValue}</span><span> ${changeType}</span>`
  }
  return formatted
}

export function getFormattedStatChange(
  current?: number,
  previous?: number,
  requiresHighlighting?: boolean,
  inverseStat: boolean = false,
  type: string = 'number',
) {
  if (type === 'incomplete') return 'No data can be shown for the selected date range.'

  if (requiresHighlighting) {
    return formatChangeWithHighlight((current || 0) - (previous || 0), inverseStat, type)
  }
  return formatChange((current || 0) - (previous || 0), type)
}
