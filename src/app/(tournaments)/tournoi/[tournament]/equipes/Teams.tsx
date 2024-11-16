'use client'

import {
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  useTransitionStyles,
} from '@floating-ui/react'
import { option, readonlyArray, separated } from 'fp-ts'
import type { Separated } from 'fp-ts/Separated'
import { flow, pipe, tuple } from 'fp-ts/function'
import type { Codec } from 'io-ts/Codec'
import * as C from 'io-ts/Codec'
import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'
import { useCallback, useMemo, useState } from 'react'
import type { Merge } from 'type-fest'

import { TeamRoleIconGold } from '../../../../../components/TeamRoleIcon'
import { ContextMenu } from '../../../../../components/floating/ContextMenu'
import { Tooltip, useTooltip } from '../../../../../components/floating/Tooltip'
import {
  ChevronForwardFilled,
  ImagesOutline,
  SettingsSharp,
} from '../../../../../components/svgs/icons'
import { constants } from '../../../../../config/constants'
import { groupAndSortAttendees } from '../../../../../helpers/groupAndSortAttendees'
import { useLocalStorageState } from '../../../../../hooks/useLocalStorageState'
import { TeamRole } from '../../../../../models/TeamRole'
import type { AttendeeWithRiotId } from '../../../../../models/attendee/AttendeeWithRiotId'
import { Attendee } from '../../../../../models/pocketBase/tables/Attendee'
import type { Team } from '../../../../../models/pocketBase/tables/Team'
import type { Tournament } from '../../../../../models/pocketBase/tables/Tournament'
import { cx } from '../../../../../utils/cx'
import { formatNumber } from '../../../../../utils/stringUtils'
import { AttendeeTile, EmptyAttendeeTile } from '../participants/AttendeeTile'

const shouldDisplayAvatarRating = true
const captainShouldDisplayPrice = false

type TeamsProps = {
  tournament: Tournament
  teams: ReadonlyArray<TeamWithRoleMembers>
  teamlessAttendees: ReadonlyArray<AttendeeWithRiotId>
}

export type TeamWithRoleMembers = Tuple<
  TeamWithStats,
  Partial<ReadonlyRecord<TeamRole, AttendeeWithRiotId>>
>

type TeamWithStats = Merge<
  Team,
  {
    balance: number
    averageAvatarRating: number
  }
>

type MercatoValue = Seed | TeamRole
type Seed = number

const mercatoValueCodec: Codec<unknown, MercatoValue, MercatoValue> = C.make(
  D.union(D.number, TeamRole.decoder),
  E.id<MercatoValue>(),
)
const nullableMercatoValueCodec = C.nullable(mercatoValueCodec)

export const Teams: React.FC<TeamsProps> = ({ tournament, teams, teamlessAttendees }) => {
  const [memberScrolled, setMemberScrolled] = useState(false)

  const onMembersMount = useCallback((e: Nullable<HTMLUListElement>) => {
    if (e !== null) {
      setMemberScrolled(e.scrollLeft > 0)
    }
  }, [])

  const handleMembersScroll = useCallback((e: React.UIEvent<HTMLUListElement>) => {
    setMemberScrolled((e.target as HTMLUListElement).scrollLeft > 0)
  }, [])

  const [mercatoPanelOpen, setMercatoPanelOpen] = useLocalStorageState(
    `${tournament.id}-mercatoPanelOpen`,
    [C.boolean, 'boolean'],
    false,
  )

  const toggleMercatoPanelOpen = useCallback(() => {
    setMercatoPanelOpen(b => !b)
  }, [setMercatoPanelOpen])

  const [mercatoValue, setMercatoValue] = useLocalStorageState(
    `${tournament.id}-mercatoValue`,
    [nullableMercatoValueCodec, 'Nullable<MercatoValue>'],
    null,
  )

  const { left: otherAttendees, right: mercatoViewAttendees } = useMemo(
    () =>
      pipe(
        partitionTeamlessAttendees(teamlessAttendees, mercatoValue),
        separated.mapLeft(roleEntries),
      ),
    [mercatoValue, teamlessAttendees],
  )

  const showTeamlessAttendees = readonlyArray.isNonEmpty(otherAttendees)

  return (
    <div className="grid h-full grid-cols-[1fr_auto]">
      <div className="grid h-full overflow-hidden">
        <div className="flex flex-col gap-6 overflow-y-auto area-1">
          <div className="grid grid-cols-[auto_1fr]">
            <ul
              ref={onMembersMount}
              onScroll={handleMembersScroll}
              className={cx(
                'col-start-2 overflow-x-auto',
                showTeamlessAttendees ? 'pb-6' : 'pb-14',
              )}
            >
              {teams.map(([team, members]) => (
                <li key={team.id} className="group/team w-max min-w-full">
                  <ul className="flex gap-4 py-4 pl-2 pr-8 group-even/team:bg-black/30">
                    {TeamRole.values.map(role => {
                      const attendee = members[role]

                      if (attendee === undefined) {
                        return <EmptyAttendeeTile key={role} role={role} />
                      }

                      return (
                        <AttendeeTile
                          key={attendee.id}
                          {...{ attendee, shouldDisplayAvatarRating, captainShouldDisplayPrice }}
                        />
                      )
                    })}
                  </ul>
                </li>
              ))}
            </ul>

            <div className="self-start overflow-y-clip area-1">
              <ul className={cx(['shadow-even shadow-black', memberScrolled])}>
                {teams.map(([team]) => (
                  <TeamInfo key={team.id} team={team} />
                ))}
              </ul>
            </div>
          </div>

          {showTeamlessAttendees && (
            <div className="flex w-full flex-col">
              <h2 className="w-[calc(100%-9.5rem)] self-center border-t border-goldenrod px-2 py-6 text-center text-lg font-bold">
                Participant·es sans équipe
              </h2>

              <div className="overflow-x-auto pb-14">
                <ul className="w-max min-w-full">
                  {otherAttendees.map(([role, attendees]) => (
                    <li key={role} className="flex gap-4 py-4 pl-2 pr-8 odd:bg-black/30">
                      <div className="flex min-h-40 flex-col items-center justify-center self-center">
                        <TeamRoleIconGold role={role} className="size-12" />
                        <span>{attendees.length}</span>
                      </div>

                      <ul className="contents">
                        {attendees.map(attendee => (
                          <AttendeeTile
                            key={attendee.id}
                            {...{ attendee, shouldDisplayAvatarRating, captainShouldDisplayPrice }}
                          />
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={toggleMercatoPanelOpen}
          className="self-center justify-self-end rounded-l-lg bg-goldenrod py-1 text-black area-1"
        >
          <ChevronForwardFilled className={cx('size-6', ['rotate-180', !mercatoPanelOpen])} />
        </button>
      </div>

      {mercatoPanelOpen && (
        <MercatoPanel
          tournamentTeamsCount={tournament.teamsCount}
          mercatoValue={mercatoValue}
          setMercatoValue={setMercatoValue}
          attendees={mercatoViewAttendees}
        />
      )}
    </div>
  )
}

/**
 * Rights are the mercato view attendees. Lefts are the others.
 */
function partitionTeamlessAttendees(
  teamlessAttendees: ReadonlyArray<AttendeeWithRiotId>,
  mercatoValue: Nullable<MercatoValue>,
): Separated<
  Partial<ReadonlyRecord<TeamRole, NonEmptyArray<AttendeeWithRiotId>>>,
  ReadonlyArray<AttendeeWithRiotId>
> {
  if (mercatoValue === null) {
    return separated.separated(groupAndSortAttendees(teamlessAttendees), [])
  }

  return pipe(
    teamlessAttendees,
    typeof mercatoValue === 'number'
      ? flow(
          readonlyArray.partition(filterBySeed(mercatoValue)),
          separated.map(readonlyArray.sort(Attendee.byRole)),
        )
      : flow(
          readonlyArray.partition(filterByRole(mercatoValue)),
          separated.map(readonlyArray.sort(Attendee.bySeed)),
        ),
    separated.mapLeft(groupAndSortAttendees),
  )
}

const filterBySeed =
  (seed: Seed) =>
  (attendee: AttendeeWithRiotId): boolean =>
    attendee.seed === seed

const filterByRole =
  (role: TeamRole) =>
  (attendee: AttendeeWithRiotId): boolean =>
    TeamRole.Eq.equals(attendee.role, role)

function roleEntries(
  attendeesByRole: Partial<ReadonlyRecord<TeamRole, NonEmptyArray<AttendeeWithRiotId>>>,
): ReadonlyArray<Tuple<TeamRole, NonEmptyArray<AttendeeWithRiotId>>> {
  return pipe(
    TeamRole.values,
    readonlyArray.filterMap(role =>
      pipe(
        option.fromNullable(attendeesByRole[role]),
        option.map(as => tuple(role, as)),
      ),
    ),
  )
}

type TeamInfoProps = {
  team: TeamWithStats
}

const TeamInfo: React.FC<TeamInfoProps> = ({ team }) => {
  const balanceTooltip = useTooltip<HTMLSpanElement>()
  const averageTooltip = useTooltip<HTMLDivElement>()

  return (
    <li className="flex min-h-[23.5rem] flex-col items-center justify-center gap-2 px-2 even:bg-black/30">
      <span className="font-lib-mono font-bold">{team.tag}</span>
      <span className="text-white">{team.name}</span>

      <div className="mx-2 mt-2 flex items-center justify-around gap-6 self-stretch">
        <span
          className="rounded-br-md rounded-tl-md bg-green1/90 px-1.5 text-white"
          {...balanceTooltip.reference}
        >
          ${team.balance.toLocaleString(constants.locale)}
        </span>
        <Tooltip {...balanceTooltip.floating}>Solde</Tooltip>

        <div
          className="flex shrink-0 items-center gap-2 text-sky-300"
          {...averageTooltip.reference}
        >
          <ImagesOutline className="size-6" />
          <span>{formatNumber(team.averageAvatarRating, 2)} / 5</span>
        </div>
        <Tooltip {...averageTooltip.floating}>Moyenne des notes de photos de profil</Tooltip>
      </div>
    </li>
  )
}

type MercatoPanelProps = {
  tournamentTeamsCount: number
  mercatoValue: Nullable<MercatoValue>
  setMercatoValue: React.Dispatch<React.SetStateAction<Nullable<MercatoValue>>>
  attendees: ReadonlyArray<AttendeeWithRiotId>
}

const MercatoPanel: React.FC<MercatoPanelProps> = ({
  tournamentTeamsCount,
  mercatoValue,
  setMercatoValue,
  attendees,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const { refs, floatingStyles, context } = useFloating<HTMLButtonElement>({
    placement: 'bottom-start',
    open: isOpen || mercatoValue === null,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), shift({ padding: 8 }), flip()],
  })

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, { duration: 300 })

  const click = useClick(context)
  const dismiss = useDismiss(context)
  const role_ = useRole(context, { role: 'listbox' })

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role_])

  const handleClick = useCallback(
    (value: MercatoValue) => () => {
      setMercatoValue(prev => (prev === value ? null : value))
      setIsOpen(false)
    },
    [setMercatoValue],
  )

  return (
    <div className="min-w-[17.5rem] overflow-y-auto border-l border-goldenrod bg-blue1 p-4">
      <div className="flex justify-between gap-4">
        <button ref={refs.setReference} type="button" {...getReferenceProps()}>
          <SettingsSharp className="size-6" />
        </button>

        {mercatoValue !== null && <pre>mercatoValue = {mercatoValue}</pre>}
      </div>

      <ContextMenu
        isMounted={isMounted}
        setFloating={refs.setFloating}
        styles={{ ...floatingStyles, ...transitionStyles }}
        props={getFloatingProps()}
        className="grid grid-cols-[auto_auto] gap-y-1.5 py-2 pt-2.5 font-medium"
      >
        <h3 className="col-span-2 justify-self-center font-bold">Enchères</h3>

        <ul className="flex flex-col justify-center gap-1 pr-2">
          {Array.from({ length: tournamentTeamsCount }).map((_, i) => {
            const seed = i + 1

            return (
              <SelectView key={seed} selected={seed === mercatoValue} onClick={handleClick(seed)}>
                Seed #{seed}
              </SelectView>
            )
          })}
        </ul>

        <ul className="flex flex-col justify-center gap-1 border-l border-goldenrod pl-2">
          {TeamRole.values.map(role => (
            <SelectView key={role} selected={role === mercatoValue} onClick={handleClick(role)}>
              {TeamRole.label[role]}
            </SelectView>
          ))}
        </ul>
      </ContextMenu>

      {readonlyArray.isNonEmpty(attendees) && (
        <ul>
          {attendees.map(attendee => (
            <AttendeeTile
              key={attendee.id}
              {...{ attendee, shouldDisplayAvatarRating, captainShouldDisplayPrice }}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

type SelectViewProps = {
  selected: boolean
  onClick: React.MouseEventHandler<HTMLButtonElement>
  children?: React.ReactNode
}

const SelectView: React.FC<SelectViewProps> = ({ selected, onClick, children }) => (
  <li>
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'w-full rounded px-2 py-0.5 text-center',
        selected ? 'bg-green1 text-white' : 'hover:bg-goldenrod hover:text-black',
      )}
    >
      {children}
    </button>
  </li>
)
