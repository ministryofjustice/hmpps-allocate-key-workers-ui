import { Router } from 'express'
import { DataAccess } from '../../data'
import { Services } from '../../services'
import setUpJourneyData from '../../middleware/journey/setUpJourneyData'
import { StartUpdateStaffRoutes } from './start-update-staff/routes'
import { UpdateCapacityAndStatusRoutes } from './update-capacity-status-and-working-pattern/routes'
import { AssignStaffRoleRoutes } from './manage-roles/assign/routes'
import { RemoveStaffRoleRoutes } from './manage-roles/remove/routes'

export default function JourneyRoutes({ cacheStore }: DataAccess, services: Services) {
  const router = Router({ mergeParams: true })

  router.use(setUpJourneyData(cacheStore('journey')))

  router.use('/start-update-staff/:staffId', StartUpdateStaffRoutes(services))
  router.use('/update-capacity-status-and-working-pattern', UpdateCapacityAndStatusRoutes(services))

  router.use('/manage-roles/assign', AssignStaffRoleRoutes(services))
  router.use('/manage-roles/remove', RemoveStaffRoleRoutes(services))

  if (process.env.NODE_ENV === 'e2e-test') {
    /* eslint-disable no-param-reassign */
    const mergeObjects = <T extends Record<string, unknown>>(destination: T, source: Partial<T>) => {
      Object.entries(source).forEach(([key, value]) => {
        if (typeof value === 'object' && !Array.isArray(value)) {
          if (!destination[key]) {
            // @ts-expect-error set up object for future recursive writes
            destination[key] = {}
          }
          mergeObjects(destination[key] as Record<string, unknown>, value)
        } else {
          // @ts-expect-error unexpected types
          destination[key] = value
        }
      })
    }

    router.get('/inject-journey-data', (req, res) => {
      const { data } = req.query
      const json = JSON.parse(atob(data as string))
      mergeObjects(req.journeyData, json)
      res.sendStatus(200)
    })
  }

  return router
}
