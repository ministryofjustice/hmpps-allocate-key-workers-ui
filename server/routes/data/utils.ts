import { Request } from 'express'
import type { components } from '../../@types/keyWorker'

export const getEstablishmentData = (stats: components['schemas']['PrisonStats'], req: Request) =>
  stats.current
    ? [
        ...(req.middleware!.policy !== 'PERSONAL_OFFICER'
          ? [
              {
                heading: 'Number of recorded [staff] sessions',
                type: 'number',
                currentValue: stats.current.recordedEvents?.find(o => o.type === 'SESSION')?.count || 0,
                previousValue: stats.previous?.recordedEvents?.find(o => o.type === 'SESSION')?.count || 0,
                calculationMethod:
                  'This figure displays the total number of [staff] sessions that happened in the selected date range. It is calculated using the date recorded in [staff] session case notes.',
              },
            ]
          : []),
        {
          heading: 'Number of recorded [staff] entries',
          type: 'number',
          currentValue: stats.current.recordedEvents?.find(o => o.type === 'ENTRY')?.count || 0,
          previousValue: stats.previous?.recordedEvents?.find(o => o.type === 'ENTRY')?.count || 0,
          calculationMethod:
            'This figure displays the total number of [staff] entries that happened in the selected date range. It is calculated using the date recorded in [staff] entry case notes.',
        },
        {
          heading: 'Total number of prisoners',
          type: 'number',
          currentValue: stats.current.totalPrisoners,
          previousValue: stats.previous?.totalPrisoners,
          calculationMethod:
            'This figure displays the average number of prisoners in the establishment during the selected date range.',
        },
        ...(req.middleware!.prisonConfiguration!.hasPrisonersWithHighComplexityNeeds
          ? [
              {
                heading: 'Total number of high complexity prisoners',
                type: 'number',
                currentValue: stats.current.highComplexityOfNeedPrisoners,
                previousValue: stats.previous?.highComplexityOfNeedPrisoners,
                calculationMethod:
                  'This figure displays the average number of high complexity prisoners in the establishment during the selected date range.',
              },
            ]
          : []),
        {
          heading: 'Percentage of prisoners with an allocated [staff]',
          type: 'percentage',
          currentValue: stats.current.percentageAssigned,
          previousValue: stats.previous?.percentageAssigned,
          calculationMethod:
            'This figure is calculated by dividing the total number of prisoners in the establishment by the total number of prisoners who have been allocated a [staff].',
        },
        {
          heading: 'Total number of active [staffs]',
          type: 'number',
          currentValue: stats.current.eligibleStaff,
          previousValue: stats.previous?.eligibleStaff,
          calculationMethod:
            'This figure displays the average total number of active [staffs] in the establishment during the selected date range. This does not include [staffs] with an unavailable or inactive status.',
        },
        req.middleware!.prisonConfiguration!.hasPrisonersWithHighComplexityNeeds
          ? {
              heading: 'Average time from eligibility to first [staff] session',
              type: 'day',
              currentValue: stats.current.avgReceptionToRecordedEventDays,
              previousValue: stats.previous?.avgReceptionToRecordedEventDays,
              calculationMethod: `This figure displays the average time between prisoners becoming eligible for ${req.middleware!.policy === 'KEY_WORKER' ? 'key work' : '[staff] sessions'} and the first recorded [staff] session for sessions recorded in the selected date range.`,
            }
          : {
              heading: 'Average time from reception to first [staff] session',
              type: 'day',
              currentValue: stats.current.avgReceptionToRecordedEventDays,
              previousValue: stats.previous?.avgReceptionToRecordedEventDays,
              calculationMethod:
                'This figure displays the average time between reception and the first recorded [staff] session for sessions recorded in the selected date range.',
            },
        req.middleware!.prisonConfiguration!.hasPrisonersWithHighComplexityNeeds
          ? {
              heading: 'Average time from eligibility to [staff] allocation',
              type: 'day',
              currentValue: stats.current.avgReceptionToAllocationDays,
              previousValue: stats.previous?.avgReceptionToAllocationDays,
              calculationMethod: `This figure displays the average time between prisoners becoming eligible for ${req.middleware!.policy === 'KEY_WORKER' ? 'key work' : '[staff] sessions'} and [staff] allocation for allocations made in the selected date range.`,
            }
          : {
              heading: 'Average time from reception to [staff] allocation',
              type: 'day',
              currentValue: stats.current.avgReceptionToAllocationDays,
              previousValue: stats.previous?.avgReceptionToAllocationDays,
              calculationMethod:
                'This figure displays the average time between reception and [staff] allocation for allocations made in the selected date range.',
            },
        ...(req.middleware!.policy !== 'PERSONAL_OFFICER'
          ? [
              {
                heading: `Delivery rate against frequency of a session every ${req.middleware!.prisonConfiguration!.frequencyInWeeks === 1 ? 'week' : `${req.middleware!.prisonConfiguration!.frequencyInWeeks} weeks`}`,
                type: 'percentage',
                currentValue: stats.current.recordedEventComplianceRate,
                previousValue: stats.previous?.recordedEventComplianceRate,
                calculationMethod:
                  'This figure is calculated by comparing the number of recorded [staff] sessions against the number of projected [staff] sessions. <br /> <br />' +
                  'The number of projected [staff] sessions is calculated by taking the total number of prisoners with an allocated [staff] and comparing it to the expected frequency of [staff] sessions.',
              },
              {
                heading: 'Number of projected [staff] sessions',
                type: 'number',
                currentValue: stats.current.projectedRecordedEvents,
                previousValue: stats.previous?.projectedRecordedEvents,
                calculationMethod:
                  'This figure is calculated by taking the total number of prisoners with an allocated [staff] and comparing it to the expected frequency of [staff] sessions.',
              },
            ]
          : []),
      ]
    : []
