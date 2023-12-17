import type { UserRole } from '../models/pocketBase/tables/User'

const isOrganiser = (role: UserRole): boolean => role === 'organiser'

export const Permissions = {
  tournaments: {
    create: isOrganiser,
  },
}
