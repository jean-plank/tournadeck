import { ord, readonlyArray } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { useMemo } from 'react'

import { TeamRole } from '../../../../../models/TeamRole'
import type { AttendeeWithRiotId } from '../../../../../models/attendee/AttendeeWithRiotId'
import type { Team } from '../../../../../models/pocketBase/tables/Team'
import { TeamId } from '../../../../../models/pocketBase/tables/Team'
import type { MatchApiDataDecoded } from '../../../../../models/pocketBase/tables/match/Match'
import { Puuid } from '../../../../../models/riot/Puuid'
import { RiotTeamId } from '../../../../../models/riot/RiotTeamId'
import type { TheQuestMatch } from '../../../../../models/theQuest/TheQuestMatch'
import { cx } from '../../../../../utils/cx'
import type { EnrichedTeam } from './GameTeam'
import { GameTeam } from './GameTeam'
import { Match, MatchWithTeam1 } from './Match'
import { PlannedOn } from './PlannedOn'

type GameProps = {
  teams: ReadonlyArray<Team>
  attendees: ReadonlyArray<AttendeeWithRiotId>
  match: MatchApiDataDecoded
}

export const Game: React.FC<GameProps> = ({ teams, attendees, match }) => {
  const { winner, plannedOn } = match

  const { team1, team2, withTeam1 } = useMemo((): {
    team1: Optional<EnrichedTeam>
    team2: Optional<EnrichedTeam>
    withTeam1: ReadonlyArray<Optional<MatchWithTeam1>>
  } => {
    const { bestOf, team1: team1Id, team2: team2Id, apiData } = match

    const team1WithMembers = getTeamWithMembers(teams, attendees, team1Id)
    const team2WithMembers = getTeamWithMembers(teams, attendees, team2Id)

    const withTeam1_ = pipe(
      Array.from({ length: Math.max(bestOf, apiData.length) }),
      readonlyArray.mapWithIndex((i): Optional<MatchWithTeam1> => {
        const match_ = apiData[i]

        if (match_ === undefined) return undefined

        return {
          match: match_,
          team1:
            team1WithMembers !== undefined
              ? findTeam1(
                  match_,
                  pipe(
                    team1WithMembers.members,
                    readonlyArray.map(a => a.puuid),
                  ),
                )
              : undefined,
        }
      }),
    )

    return {
      team1: enrichTeam(team1WithMembers, withTeam1_, true),
      team2: enrichTeam(team2WithMembers, withTeam1_, false),
      withTeam1: withTeam1_,
    }
  }, [attendees, match, teams])

  return (
    <li className="flex flex-col">
      {plannedOn !== '' && <PlannedOn plannedOn={plannedOn} />}

      <div className="flex flex-col gap-0.5 overflow-hidden">
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

        {withTeam1.map((d, i) => {
          if (d === undefined) {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <div key={i} className="grid grid-cols-2 gap-0.5">
                <span className="bg-grey1 px-2 py-1 text-white/50">-</span>
                <span className="bg-grey1 px-2 py-1 text-end text-white/50">-</span>
              </div>
            )
          }

          return (
            // eslint-disable-next-line react/no-array-index-key
            <Match key={i} {...d} />
          )
        })}
      </div>
    </li>
  )
}

const byRole = pipe(
  TeamRole.Ord,
  ord.contramap((b: AttendeeWithRiotId) => b.role),
)

type TeamWithMembers = {
  team: Team
  members: ReadonlyArray<AttendeeWithRiotId>
}

function getTeamWithMembers(
  teams: ReadonlyArray<Team>,
  attendees: ReadonlyArray<AttendeeWithRiotId>,
  teamId: '' | TeamId,
): Optional<TeamWithMembers> {
  const team = teamId !== '' ? teams.find(t => TeamId.Eq.equals(t.id, teamId)) : undefined

  if (team === undefined) return undefined

  return {
    team,
    members: pipe(
      attendees,
      readonlyArray.filter(a => a.team !== '' && TeamId.Eq.equals(a.team, team.id)),
      readonlyArray.sort(byRole),
    ),
  }
}

function enrichTeam(
  t: Optional<TeamWithMembers>,
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
