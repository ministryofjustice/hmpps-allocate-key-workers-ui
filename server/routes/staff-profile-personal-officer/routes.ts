import { Services } from '../../services'
import { POStaffProfileController } from './controller'
import { StaffProfileRoutes } from '../staff-profile/routes'

export const POStaffProfileRoutes = ({ allocationsApiService }: Services) =>
  StaffProfileRoutes(new POStaffProfileController(allocationsApiService))
