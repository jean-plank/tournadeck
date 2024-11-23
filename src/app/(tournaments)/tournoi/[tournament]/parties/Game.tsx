import { option, ord, readonlyArray } from 'fp-ts'
import { flow, pipe, tuple } from 'fp-ts/function'
import { useMemo } from 'react'

import { EmptyMatch } from '../../../../../components/emptyMatch/EmptyMatch'
import { TeamRole } from '../../../../../models/TeamRole'
import type { AttendeeWithRiotId } from '../../../../../models/attendee/AttendeeWithRiotId'
import { Attendee } from '../../../../../models/pocketBase/tables/Attendee'
import type { Team } from '../../../../../models/pocketBase/tables/Team'
import { TeamId } from '../../../../../models/pocketBase/tables/Team'
import type { MatchApiDataDecoded } from '../../../../../models/pocketBase/tables/match/Match'
import type { DDragonVersion } from '../../../../../models/riot/DDragonVersion'
import { Puuid } from '../../../../../models/riot/Puuid'
import { RiotTeamId } from '../../../../../models/riot/RiotTeamId'
import type { TheQuestMatch } from '../../../../../models/theQuest/TheQuestMatch'
import { cx } from '../../../../../utils/cx'
import { array, partialRecord } from '../../../../../utils/fpTsUtils'
import type { EnrichedTeam } from './GameTeam'
import { GameTeam } from './GameTeam'
import { Match } from './Match'
import type { EnrichedParticipant } from './MatchTooltip'
import { PlannedOn } from './PlannedOn'

type GameProps = {
  version: DDragonVersion
  teams: ReadonlyArray<Team>
  attendees: ReadonlyArray<AttendeeWithRiotId>
  match: MatchApiDataDecoded
  canUpdateMatch: boolean
  onEmptyMatchClick: React.MouseEventHandler<HTMLButtonElement>
}

export const Game: React.FC<GameProps> = ({
  version,
  teams,
  attendees,
  match,
  canUpdateMatch,
  onEmptyMatchClick,
}) => {
  const { winner, bestOf, plannedOn, apiData } = match

  const { team1, team2, matchesWithTeam1 } = useMemo((): {
    team1: Optional<EnrichedTeam>
    team2: Optional<EnrichedTeam>
    matchesWithTeam1: ReadonlyArray<MatchWithTeam1>
  } => {
    const team1WithMembers = getTeamWithMembers(teams, attendees, match.team1)
    const team2WithMembers = getTeamWithMembers(teams, attendees, match.team2)

    const withTeam1_ = pipe(
      match.apiData,
      readonlyArray.filterMap(
        flow(
          option.fromNullable,
          option.map(m => ({
            match: m,
            team1:
              team1WithMembers !== undefined
                ? findTeam1(
                    m,
                    pipe(
                      team1WithMembers.members,
                      readonlyArray.map(a => a.puuid),
                    ),
                  )
                : undefined,
          })),
        ),
      ),
    )

    return {
      team1: enrichTeam(team1WithMembers, withTeam1_, true),
      team2: enrichTeam(team2WithMembers, withTeam1_, false),
      matchesWithTeam1: withTeam1_,
    }
  }, [attendees, match, teams])

  return (
    <li className="flex flex-col">
      {plannedOn !== '' && <PlannedOn plannedOn={plannedOn} />}

      <div className="flex flex-col gap-0.5">
        <div className="grid grid-cols-2 gap-0.5">
          {[team1, team2].map((team, i) => {
            const isEven = i % 2 === 0
            const isWinner =
              team !== undefined && winner !== '' && TeamId.Eq.equals(team.id, winner)

            return (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                className={cx(
                  'group w-full grid items-center gap-4 text-white bg-zinc-700 px-2 py-1.5 odd:border-l-4 even:border-r-4',
                  isEven ? 'grid-cols-[1fr_auto]' : 'grid-cols-[auto_1fr]',
                  isWinner
                    ? 'odd:border-l-goldenrod even:border-r-goldenrod'
                    : 'odd:border-l-zinc-700 even:border-r-zinc-700',
                )}
              >
                {team !== undefined ? (
                  <GameTeam team={team} isEven={isEven} isWinner={isWinner} />
                ) : (
                  <span
                    className={cx('text-white/50 group-even:justify-self-end', [
                      'col-start-2',
                      !isEven,
                    ])}
                  >
                    -
                  </span>
                )}
              </div>
            )
          })}
        </div>

        <ul className="flex flex-col-reverse">
          {pipe(
            Array.from({ length: Math.max(bestOf, apiData.length) }),
            array.mapWithIndexWithAcc(true, (i, _, isFirstEmpty) => {
              const matchWithTeam1 = matchesWithTeam1[i]

              if (matchWithTeam1 === undefined) {
                return tuple(
                  <EmptyMatch
                    key={i}
                    canUpdateMatch={canUpdateMatch}
                    isFirst={isFirstEmpty}
                    onClick={onEmptyMatchClick}
                  />,
                  false,
                )
              }

              const { blueIsLeft, leftWon } = MatchWithTeam1.predicates(matchWithTeam1)

              const enrichedParticipants = pipe(
                matchWithTeam1.match.teams,
                partialRecord.map((team): ReadonlyArray<EnrichedParticipant> => {
                  if (team === undefined) return []

                  return pipe(
                    team.participants,
                    readonlyArray.map(
                      (p): EnrichedParticipant => ({
                        ...p,
                        member: attendees.find(a => Puuid.Eq.equals(a.puuid, p.puuid)),
                      }),
                    ),
                    readonlyArray.sort(byOptionalRole),
                  )
                }),
              )

              return tuple(
                <Match
                  key={matchWithTeam1.match.id}
                  version={version}
                  matchId={match.id}
                  gameId={matchWithTeam1.match.id}
                  gameDuration={matchWithTeam1.match.gameDuration}
                  left={(blueIsLeft ? enrichedParticipants[100] : enrichedParticipants[200]) ?? []}
                  right={(blueIsLeft ? enrichedParticipants[200] : enrichedParticipants[100]) ?? []}
                  blueIsLeft={blueIsLeft}
                  leftWon={leftWon}
                  blueWon={RiotTeamId.Eq.equals(matchWithTeam1.match.win, 100)}
                  canUpdateMatch={canUpdateMatch}
                />,
                isFirstEmpty,
              )
            }),
            readonlyArray.reverse,
          )}
        </ul>
      </div>
    </li>
  )
}

type MatchWithTeam1 = {
  match: TheQuestMatch
  team1: Optional<RiotTeamId>
}

type MatchWithTeam1Predicates = {
  blueIsLeft: boolean
  leftWon: boolean
}

const MatchWithTeam1 = {
  predicates: ({ match, team1 }: MatchWithTeam1): MatchWithTeam1Predicates => {
    const blueIsLeft = team1 === 100

    return { blueIsLeft, leftWon: blueIsLeft ? match.win === 100 : match.win === 200 }
  },
}

const byOptionalRole = pipe(
  ord.fromCompare<Optional<TeamRole>>((first, second) => {
    if (first === undefined) {
      if (second === undefined) return 0
      return 1
    }

    if (second === undefined) return -1

    return TeamRole.Ord.compare(first, second)
  }),
  ord.contramap((b: EnrichedParticipant) => b.member?.role),
)

type TeamWithMember = {
  team: Team
  members: ReadonlyArray<AttendeeWithRiotId>
}

function getTeamWithMembers(
  teams: ReadonlyArray<Team>,
  attendees: ReadonlyArray<AttendeeWithRiotId>,
  teamId: '' | TeamId,
): Optional<TeamWithMember> {
  const team = teamId !== '' ? teams.find(t => TeamId.Eq.equals(t.id, teamId)) : undefined

  if (team === undefined) return undefined

  return {
    team,
    members: pipe(
      attendees,
      readonlyArray.filter(a => a.team !== '' && TeamId.Eq.equals(a.team, team.id)),
      readonlyArray.sort(Attendee.byRole),
    ),
  }
}

function enrichTeam(
  t: Optional<TeamWithMember>,
  withTeam1: ReadonlyArray<Optional<MatchWithTeam1>>,
  isTeam1: boolean,
): Optional<EnrichedTeam> {
  if (t === undefined) return undefined

  const { team, members } = t

  // TODO: Monoid
  let victoryCount = 0

  withTeam1.forEach(d => {
    if (d !== undefined) {
      const { leftWon } = MatchWithTeam1.predicates(d)

      if ((leftWon && isTeam1) || (!leftWon && !isTeam1)) {
        victoryCount += 1
      }
    }
  })

  return { ...team, members, victoryCount }
}

function findTeam1(match: TheQuestMatch, team1Members: ReadonlyArray<Puuid>): Optional<RiotTeamId> {
  for (const id of RiotTeamId.values) {
    const team = match.teams[id]

    if (
      team !== undefined &&
      pipe(
        team.participants,
        readonlyArray.exists(p => readonlyArray.elem(Puuid.Eq)(p.puuid, team1Members)),
      )
    ) {
      return id
    }
  }

  return undefined
}
