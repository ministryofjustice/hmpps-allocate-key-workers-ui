import { Request } from 'express'
import type { components } from '../../@types/keyWorker'

function sessionEntry(req: Request, plural: boolean = false) {
  if (req.middleware!.policy === 'PERSONAL_OFFICER') {
    return plural ? 'entries' : 'entry'
  }
  return plural ? 'sessions' : 'session'
}

/* eslint-disable  @typescript-eslint/no-explicit-any */
const createDataItem = (
  heading: string,
  type: string,
  currentValue: any,
  previousValue: any,
  calculationMethod: string,
  requiresHighlighting: boolean = true,
) => {
  const hasPreviousWithoutCurrent = previousValue && !currentValue
  const hasNoData = !previousValue && !currentValue

  if (hasPreviousWithoutCurrent || hasNoData) {
    return {
      heading,
      type: 'incomplete',
      currentValue: null,
      previousValue: null,
      calculationMethod,
      requiresHighlighting,
    }
  }

  return {
    heading,
    type,
    currentValue,
    previousValue,
    calculationMethod,
    requiresHighlighting,
  }
}

export const getEstablishmentData = (stats: components['schemas']['PrisonStats'], req: Request) =>
  stats.current
    ? [
        ...(req.middleware!.policy !== 'PERSONAL_OFFICER'
          ? [
              createDataItem(
                'Number of recorded [staff] sessions',
                'number',
                stats.current.recordedEvents?.find(o => o.type === 'SESSION')?.count || 0,
                stats.previous?.recordedEvents?.find(o => o.type === 'SESSION')?.count || 0,
                'This figure displays the total number of [staff] sessions that happened in the selected date range. It is calculated using the date recorded in [staff] session case notes.',
              ),
            ]
          : []),
        createDataItem(
          'Number of recorded [staff] entries',
          'number',
          stats.current.recordedEvents?.find(o => o.type === 'ENTRY')?.count || 0,
          stats.previous?.recordedEvents?.find(o => o.type === 'ENTRY')?.count || 0,
          'This figure displays the total number of [staff] entries that happened in the selected date range. It is calculated using the date recorded in [staff] entry case notes.',
        ),
        createDataItem(
          'Total number of prisoners',
          'number',
          stats.current.totalPrisoners,
          stats.previous?.totalPrisoners,
          'This figure displays the average number of prisoners in the establishment during the selected date range.',
          false,
        ),
        ...(req.middleware!.prisonConfiguration!.hasPrisonersWithHighComplexityNeeds
          ? [
              createDataItem(
                'Total number of high complexity prisoners',
                'number',
                stats.current.highComplexityOfNeedPrisoners,
                stats.previous?.highComplexityOfNeedPrisoners,
                'This figure displays the average number of high complexity prisoners in the establishment during the selected date range.',
                false,
              ),
            ]
          : []),
        createDataItem(
          'Percentage of prisoners with an allocated [staff]',
          'percentage',
          stats.current.percentageAssigned,
          stats.previous?.percentageAssigned,
          'This figure is calculated by dividing the total number of prisoners in the establishment by the total number of prisoners who have been allocated a [staff].',
        ),
        createDataItem(
          'Total number of active [staffs]',
          'number',
          stats.current.eligibleStaff,
          stats.previous?.eligibleStaff,
          'This figure displays the average total number of active [staffs] in the establishment during the selected date range. This does not include [staffs] with an unavailable or inactive status.',
        ),
        req.middleware!.prisonConfiguration!.hasPrisonersWithHighComplexityNeeds
          ? createDataItem(
              `Average time from eligibility to first [staff] ${sessionEntry(req)}`,
              'day',
              stats.current.avgReceptionToRecordedEventDays,
              stats.previous?.avgReceptionToRecordedEventDays,
              `This figure displays the average time between prisoners becoming eligible for ${req.middleware!.policy === 'KEY_WORKER' ? 'key work' : '[staff] entries'} and the first recorded [staff] ${sessionEntry(req)} for ${sessionEntry(req, true)} recorded in the selected date range.`,
            )
          : createDataItem(
              `Average time from reception to first [staff] ${sessionEntry(req)}`,
              'day',
              stats.current.avgReceptionToRecordedEventDays,
              stats.previous?.avgReceptionToRecordedEventDays,
              `This figure displays the average time between reception and the first recorded [staff] ${sessionEntry(req)} for ${sessionEntry(req, true)} recorded in the selected date range.`,
            ),
        req.middleware!.prisonConfiguration!.hasPrisonersWithHighComplexityNeeds
          ? createDataItem(
              'Average time from eligibility to [staff] allocation',
              'day',
              stats.current.avgReceptionToAllocationDays,
              stats.previous?.avgReceptionToAllocationDays,
              `This figure displays the average time between prisoners becoming eligible for ${req.middleware!.policy === 'KEY_WORKER' ? 'key work' : '[staff] entries'} and [staff] allocation for allocations made in the selected date range.`,
            )
          : createDataItem(
              'Average time from reception to [staff] allocation',
              'day',
              stats.current.avgReceptionToAllocationDays,
              stats.previous?.avgReceptionToAllocationDays,
              'This figure displays the average time between reception and [staff] allocation for allocations made in the selected date range.',
            ),
        ...(req.middleware!.policy !== 'PERSONAL_OFFICER'
          ? [
              createDataItem(
                `Delivery rate against frequency of a session every ${req.middleware!.prisonConfiguration!.frequencyInWeeks === 1 ? 'week' : `${req.middleware!.prisonConfiguration!.frequencyInWeeks} weeks`}`,
                'percentage',
                stats.current.recordedEventComplianceRate,
                stats.previous?.recordedEventComplianceRate,
                'This figure is calculated by comparing the number of recorded [staff] sessions against the number of projected [staff] sessions. <br /> <br />' +
                  'The number of projected [staff] sessions is calculated by taking the total number of prisoners with an allocated [staff] and comparing it to the expected frequency of [staff] sessions.',
              ),
              createDataItem(
                'Number of projected [staff] sessions',
                'number',
                stats.current.projectedRecordedEvents,
                stats.previous?.projectedRecordedEvents,
                'This figure is calculated by taking the total number of prisoners with an allocated [staff] and comparing it to the expected frequency of [staff] sessions.',
                false,
              ),
            ]
          : []),
      ]
    : []
