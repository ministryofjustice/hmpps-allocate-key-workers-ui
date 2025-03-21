import { getDateInReadableFormat } from './nunjucksSetup'
import { formatDateConcise } from './datetimeUtils'

const getLastFullMonthAsIsoDateString = () => {
  const lastMonth = new Date()
  lastMonth.setMonth(lastMonth.getMonth() - 1)

  const firstDay = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1)
  const lastDay = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0)

  return { start: firstDay.toISOString().substring(0, 10), end: lastDay.toISOString().substring(0, 10) }
}

const getComparisonDates = (fromDate: string, toDate: string) => {
  const fromDateDate = new Date(fromDate)
  const toDateDate = new Date(toDate)
  const diff = Math.abs(toDateDate.getTime() - fromDateDate.getTime())
  const diffAsDays = Math.floor(diff / (1000 * 3600 * 24))

  const newFromDate = new Date(fromDateDate.getTime() - diffAsDays * 24 * 60 * 60 * 1000)
  const newToDate = new Date(fromDateDate.getTime() - 24 * 60 * 60 * 1000)

  return { start: newFromDate.toISOString().substring(0, 10), end: newToDate.toISOString().substring(0, 10) }
}

const nowSpan = getLastFullMonthAsIsoDateString()
const previousSpan = getComparisonDates(nowSpan.start, nowSpan.end)
export const dateFrom = getDateInReadableFormat(formatDateConcise(nowSpan.start)!)
export const dateTo = getDateInReadableFormat(formatDateConcise(nowSpan.end)!)
export const comparisonDateFrom = getDateInReadableFormat(formatDateConcise(previousSpan.start)!)
export const comparisonDateTo = getDateInReadableFormat(formatDateConcise(previousSpan.end)!)
