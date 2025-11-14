import { Services } from '../../services'
import { KWStaffProfileController } from './controller'
import { StaffProfileRoutes } from '../staff-profile/routes'

export const KWStaffProfileRoutes = ({ allocationsApiService }: Services) =>
  StaffProfileRoutes(new KWStaffProfileController(allocationsApiService))
