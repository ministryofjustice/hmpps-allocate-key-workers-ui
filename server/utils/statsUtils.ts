export const formatNumber = (value: string | number, type?: string): number => {
  if (type === 'percentage') return Number(parseFloat(value.toString()).toFixed(2))
  return Number(value)
}

export const formatValue = (value: number, type: string = 'number'): string | number => {
  if (type === 'percentage') return `${value} %`
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
