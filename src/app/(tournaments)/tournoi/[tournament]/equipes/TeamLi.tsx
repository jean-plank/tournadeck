import { useDroppable } from '@dnd-kit/core'

import { TeamRoleIcon } from '../../../../../components/TeamRoleIcon'
import { AttendeeTile } from '../../../../../components/attendee/AttendeeTile'
import { TeamRole } from '../../../../../models/TeamRole'
import type { AttendeeWithRiotId } from '../../../../../models/attendee/AttendeeWithRiotId'
import type { TeamId } from '../../../../../models/pocketBase/tables/Team'
import { cx } from '../../../../../utils/cx'
import { captainShouldDisplayPrice, shouldDisplayAvatarRating } from './constants'

type TeamLiProps = {
  teamId: TeamId
  members: Partial<ReadonlyRecord<TeamRole, AttendeeWithRiotId>>
  highlight: Optional<TeamRole>
}

export const TeamLi: React.FC<TeamLiProps> = ({ teamId, members, highlight }) => {
  const { setNodeRef } = useDroppable({
    id: `${teamId}-teamLi`,
    data: teamId,
  })

  return (
    <li ref={setNodeRef} className="group/team w-max min-w-full">
      <ul
        className={cx(
          'flex gap-4 py-4 pl-2 pr-8 transition-[background] duration-300',
          highlight !== undefined ? 'bg-green1/30' : 'group-even/team:bg-black/30',
        )}
      >
        {TeamRole.values.map(role => {
          const attendee = members[role]

          if (attendee === undefined) {
            return <EmptyAttendeeTile key={role} role={role} highlight={highlight === role} />
          }

          return (
            <AttendeeTile
              key={attendee.id}
              attendee={attendee}
              shouldDisplayAvatarRating={shouldDisplayAvatarRating}
              captainShouldDisplayPrice={captainShouldDisplayPrice}
            />
          )
        })}
      </ul>
    </li>
  )
}

type EmptyAttendeeTileProps = {
  role: TeamRole
  highlight: boolean
}

const EmptyAttendeeTile: React.FC<EmptyAttendeeTileProps> = ({ role, highlight }) => (
  <li className="min-h-[21.5rem]">
    <div
      className={cx(
        'm-1 flex h-full w-60 items-center justify-center rounded-lg border-2 transition-all duration-300',
        highlight ? 'border-white/80' : 'border-burgundy/30',
      )}
    >
      <TeamRoleIcon
        role={role}
        className={cx(
          'size-14 transition-all duration-300',
          highlight ? 'text-white/80' : 'text-burgundy/80',
        )}
        secondaryClassName={cx(
          'transition-all duration-300',
          highlight ? 'text-white/20' : 'text-burgundy/30',
        )}
      />
    </div>
  </li>
)
