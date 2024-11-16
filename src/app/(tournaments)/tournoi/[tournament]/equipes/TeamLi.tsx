import { useDroppable } from '@dnd-kit/core'

import { AttendeeTile, EmptyAttendeeTile } from '../../../../../components/attendee/AttendeeTile'
import { TeamRole } from '../../../../../models/TeamRole'
import type { AttendeeWithRiotId } from '../../../../../models/attendee/AttendeeWithRiotId'
import { TeamId } from '../../../../../models/pocketBase/tables/Team'
import { captainShouldDisplayPrice, shouldDisplayAvatarRating } from './constants'

type Props = {
  teamId: TeamId
  members: Partial<ReadonlyRecord<TeamRole, AttendeeWithRiotId>>
}

export const TeamLi: React.FC<Props> = ({ teamId, members }) => {
  const { active, isOver, setNodeRef } = useDroppable({ id: TeamId.unwrap(teamId) })

  return (
    <li ref={setNodeRef} className="group/team w-max min-w-full">
      <ul className="flex gap-4 py-4 pl-2 pr-8 group-even/team:bg-black/30">
        {TeamRole.values.map(role => {
          const attendee = members[role]

          if (attendee === undefined) {
            return (
              <EmptyAttendeeTile
                key={role}
                role={role}
                highlight={
                  isOver &&
                  active !== null &&
                  (active.data.current as AttendeeWithRiotId).role === role
                }
              />
            )
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
