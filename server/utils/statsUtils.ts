export const formatNumber = (value: string | number, type?: string): number => {
  if (type === 'percentage') return Number(parseFloat(value.toString()).toFixed(2))
  return Number(value)
}

export const formatValue = (value: number, type: string): string | number => {
  if (type === 'percentage') return `${value} %`
  if (value === 0) return 0
  if (!value) return '-'
  return Number(value)
}

export const formatChange = (change: number, type: string): string | number => {
  const formatted = formatValue(change, type)
  if (typeof formatted === 'number') {
    if (change > 0) return `+${formatted} increase`
    if (change < 0) return `${formatted} decrease`
    if (change === 0) return 'No change'
    return formatted
  }
  if (change > 0) return `+${formatted} increase`
  if (change < 0) return `${formatted} decrease`
  if (change === 0) return 'No change'
  return formatted
}
