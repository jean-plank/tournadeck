import type { Tournament } from '../models/pocketBase/tables/Tournament'
import type { UserRole } from '../models/pocketBase/tables/User'

const isAnyRole: (role: UserRole) => boolean = () => true

const isOrganiser = (role: UserRole): boolean => role === 'organiser'

export const Permissions = {
  attendees: {
    create: isAnyRole,
  },
  tournaments: {
    list: isAnyRole,

    view: (role: UserRole, tournament: Tournament): boolean => {
      if (isOrganiser(role)) return true

      return tournament.isVisible
    },

    create: isOrganiser,
  },
  teams: {
    buyAttendee: (role: UserRole, tournament: Tournament) =>
      tournament.phase === 'teamDraft' && isOrganiser(role),
  },
  championSelect: {
    create: isAnyRole,
  },
  matches: {
    update: isOrganiser,
  },
}
