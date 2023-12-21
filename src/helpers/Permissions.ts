import type { UserRole } from '../models/pocketBase/tables/User'

const isAnyRole: (role: UserRole) => boolean = () => true

const isOrganiser = (role: UserRole): boolean => role === 'organiser'

export const Permissions = {
  test: {
    create: isAnyRole,
  },
  tournaments: {
    create: isOrganiser,
  },
}
