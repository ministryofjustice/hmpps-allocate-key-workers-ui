import { components } from '../../../../@types/keyWorker'

export const getUpdateCapacityStatusSuccessMessage = (
  statusCode: string,
  capacity: number,
  keyworkerDetails: components['schemas']['KeyworkerDetails'],
) => {
  const subjects: string[] = []
  if (keyworkerDetails.status.code !== statusCode) {
    subjects.push('status')
  }
  if (keyworkerDetails.capacity !== capacity) {
    subjects.push('capacity')
  }
  // fallback success message in case the status is the same, but user updated the allocation options
  if (subjects.length === 0) {
    subjects.push('status')
  }

  return `You have updated this key worker’s ${subjects.join(' and ')}.`
}
