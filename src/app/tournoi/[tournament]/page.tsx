import { readonlyArray } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { redirect } from 'next/navigation'

import { listAttendeesForTournament } from '../../../actions/attendees'
import { listMatchesForTournament } from '../../../actions/matches'
import { viewTournament } from '../../../actions/tournaments'
import { CroppedChampionSquare } from '../../../components/CroppedChampionSquare'
import { theQuestService } from '../../../context'
import { TournamentFC } from '../../../domain/tournoi/[tournament]/TournamentFC'
import type { TournamentId } from '../../../models/pocketBase/tables/Tournament'
import { ChampionId } from '../../../models/riot/ChampionId'
import type { MatchDecoded } from '../../../models/riot/MatchDecoded'
import type { TheQuestMatch } from '../../../models/theQuest/TheQuestMatch'
import { StaticDataChampion } from '../../../models/theQuest/staticData/StaticDataChampion'
import { objectValues } from '../../../utils/fpTsUtils'

type Props = {
  params: { tournament: TournamentId }
}

const TournamentPage: React.FC<Props> = async ({ params }) => {
  const tournament = await viewTournament(params.tournament)

  if (tournament === undefined) {
    return redirect('/')
  }

  const [staticData, matches, attendees] = await Promise.all([
    theQuestService.getStaticData(),
    listMatchesForTournament(params.tournament),
    listAttendeesForTournament(params.tournament),
  ])

  const { stillAvailable, alreadyPlayed } = partionChampions(staticData.champions, matches)

  return (
    <div className="min-h-full">
      <div className="flex flex-col gap-4 p-4">
        <h2>Champions disponibles :</h2>
        <ul className="flex flex-wrap gap-1">
          {stillAvailable.map(c => (
            <CroppedChampionSquare
              key={c.key}
              version={staticData.version}
              championId={c.id}
              championName={c.name}
              width={54}
              height={54}
              as="li"
              className="h-12 w-12"
            />
          ))}
        </ul>

        <h2>Champions déjà joués :</h2>
        <ul className="flex flex-wrap gap-1">
          {alreadyPlayed.map(c => (
            <CroppedChampionSquare
              key={c.key}
              version={staticData.version}
              championId={c.id}
              championName={c.name}
              width={54}
              height={54}
              as="li"
              className="relative h-12 w-12"
            >
              <span className="absolute top-[calc(100%_-_2px)] w-20 origin-left -rotate-45 border-t-4 border-red-500 shadow-even shadow-black" />
            </CroppedChampionSquare>
          ))}
        </ul>
        <hr />
      </div>

      <div
        className="bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/synthwave.jpg')" }}
      >
        <TournamentFC tournament={tournament} attendees={attendees} />
      </div>
    </div>
  )
}

export default TournamentPage

type PartionedChampions = {
  stillAvailable: ReadonlyArray<StaticDataChampion>
  alreadyPlayed: ReadonlyArray<StaticDataChampion>
}

function partionChampions(
  champions: ReadonlyArray<StaticDataChampion>,
  matches: ReadonlyArray<MatchDecoded>,
): PartionedChampions {
  const playedChampions = pipe(
    matches,
    readonlyArray.flatMap(m => (m.apiData !== null ? matchChampions(m.apiData) : [])),
  )

  const { right: alreadyPlayed, left: stillAvailable } = pipe(
    champions,
    readonlyArray.sort(StaticDataChampion.byName),
    readonlyArray.partition(c => readonlyArray.elem(ChampionId.Eq)(c.id, playedChampions)),
  )

  return { stillAvailable, alreadyPlayed }
}

function matchChampions(match: TheQuestMatch): ReadonlyArray<ChampionId> {
  return pipe(
    objectValues(match.teams),
    readonlyArray.flatMap(t => (t !== undefined ? t.participants.map(p => p.championName) : [])),
  )
}
