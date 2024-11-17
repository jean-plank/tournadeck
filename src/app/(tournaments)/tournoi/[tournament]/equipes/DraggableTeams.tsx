'use client'

import type { DragEndEvent } from '@dnd-kit/core'
import { DndContext, DragOverlay, useDndContext } from '@dnd-kit/core'
import { pipe, tuple } from 'fp-ts/function'
import { startTransition, useCallback, useMemo, useOptimistic, useState } from 'react'
import type { Except } from 'type-fest'

import { buyAttendee } from '../../../../../actions/buyAttendee'
import { AttendeeTile } from '../../../../../components/AttendeeTile'
import type { TeamRole } from '../../../../../models/TeamRole'
import type { AttendeeWithRiotId } from '../../../../../models/attendee/AttendeeWithRiotId'
import { TeamId } from '../../../../../models/pocketBase/tables/Team'
import { partialRecord } from '../../../../../utils/fpTsUtils'
import type { TeamWithStats } from './TeamInfo'
import type { DraggingState, TeamsProps } from './Teams'
import { Teams } from './Teams'
import { captainShouldDisplayPrice, shouldDisplayAvatarRating } from './constants'

type Props = Except<TeamsProps, 'draggingState'>

export const DraggableTeams: React.FC<Props> = ({
  tournament,
  teams: teams_,
  teamlessAttendees: teamlessAttendees_,
}) => {
  const [isDragging, setIsDragging] = useState(false)

  type Optimist = Pick<TeamsProps, 'teams' | 'teamlessAttendees'>
  type OptimistAction = readonly [TeamId, AttendeeWithRiotId, number]

  const [
    { teams: optimisticTeams, teamlessAttendees: optimisticTeamlessAttendees },
    addOptimisticTeams,
  ] = useOptimistic<Optimist, OptimistAction>(
    { teams: teams_, teamlessAttendees: teamlessAttendees_ },
    (state, [teamId, attendee, price]) => ({
      teams: state.teams.map(t => {
        const [team, members] = t

        if (team.id !== teamId) return t

        const newTeam: TeamWithStats = {
          ...team,
          balance: team.balance - price,
        }

        const withUpdatedCaptain = pipe(
          members,
          partialRecord.mapWithIndex((role, a) =>
            a !== undefined && a.isCaptain ? { ...a, price: a.price - price } : a,
          ),
        )

        const newMembers: Partial<ReadonlyRecord<TeamRole, AttendeeWithRiotId>> = {
          ...withUpdatedCaptain,
          [attendee.role]: { ...attendee, price },
        }

        return tuple(newTeam, newMembers)
      }),
      teamlessAttendees: state.teamlessAttendees.filter(a => a.id !== attendee.id),
    }),
  )

  const handleDragStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleDragEnd = useCallback(
    async ({ active, over }: DragEndEvent) => {
      if (over !== null) {
        const teamId = over.data.current as TeamId
        const team = optimisticTeams.find(([t]) => TeamId.Eq.equals(t.id, teamId))

        const attendee = active.data.current as AttendeeWithRiotId

        if (
          team !== undefined &&
          team[1][(active.data.current as AttendeeWithRiotId).role] === undefined
        ) {
          const priceStr = prompt('Montant :')

          if (priceStr !== null) {
            const price = Number(priceStr)

            if (!isNaN(price)) {
              startTransition(() => {
                addOptimisticTeams([teamId, attendee, price])
              })

              await buyAttendee(teamId, attendee.id, price)
            }
          }
        }
      }

      setIsDragging(false)
    },
    [addOptimisticTeams, optimisticTeams],
  )

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <DraggableTeamsBis
        tournament={tournament}
        teams={optimisticTeams}
        teamlessAttendees={optimisticTeamlessAttendees}
        isDragging={isDragging}
      />
    </DndContext>
  )
}

const DraggableTeamsBis: React.FC<Props & { isDragging: boolean }> = ({ isDragging, ...props }) => {
  const { active, over } = useDndContext()

  const draggingState = useMemo<Optional<DraggingState>>(() => {
    if (active === null) return undefined

    const attendee = active.data.current as AttendeeWithRiotId
    const teamId = over?.data.current as Optional<TeamId>

    return {
      active: attendee,
      over: teamId,
      disabled:
        teamId !== undefined &&
        props.teams.some(([t, as]) => t.id === teamId && as[attendee.role] !== undefined),
    }
  }, [active, over?.data, props.teams])

  return (
    <>
      <Teams {...props} draggingState={draggingState} />

      <DragOverlay>
        {isDragging && active !== null ? (
          <AttendeeTile
            attendee={active.data.current as AttendeeWithRiotId}
            shouldDisplayAvatarRating={shouldDisplayAvatarRating}
            captainShouldDisplayPrice={captainShouldDisplayPrice}
          />
        ) : null}
      </DragOverlay>
    </>
  )
}
