import type { UserRole } from '../models/pocketBase/tables/User'

const isAnyRole: (role: UserRole) => boolean = () => true

const isOrganiser = (role: UserRole): boolean => role === 'organiser'

export const Permissions = {
  attendees: {
    create: isAnyRole,
  },
  tournaments: {
    list: isAnyRole,
    view: isAnyRole,
    create: isOrganiser,
  },
}
