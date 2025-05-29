export const formatNumber = (value: string | number, type?: string): number => {
  if (type === 'percentage') return Number(parseFloat(value.toString()).toFixed(2))
  return Number(value)
}

export const formatValue = (value: number, type: string = 'number'): string | number => {
  if (type === 'percentage') {
    const roundedValue = value.toFixed(2)
    return `${roundedValue} %`
  }
  if (type === 'day') return `${value} days`
  if (value === 0) return 0
  if (!value) return '-'
  return Number(value)
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

export const formatChangeWithHighlight = (change: number, type: string = 'number'): string | number => {
  const formatted = formatValue(change, type)
  let className = ''
  let formattedValue = ''
  let changeType = ''

  if (change > 0) {
    className = 'stat-change--increase'
    formattedValue = `+${formatted}`
    changeType = 'increase'
  } else if (change < 0) {
    className = 'stat-change--decrease'
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

export function getHighlightedStatChange(current?: number, previous?: number, type: string = 'number') {
  return formatChangeWithHighlight((current || 0) - (previous || 0), type)
}
