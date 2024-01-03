import { readonlyArray } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { notFound } from 'next/navigation'
import type { Merge } from 'type-fest'

import type { ViewTournament } from '../../../../../actions/viewTournament'
import { viewTournament } from '../../../../../actions/viewTournament'
import { CroppedChampionSquare } from '../../../../../components/CroppedChampionSquare'
import { withRedirectOnAuthError } from '../../../../../helpers/withRedirectOnAuthError'
import type { TournamentId } from '../../../../../models/pocketBase/tables/Tournament'
import type { MatchApiDataDecoded } from '../../../../../models/pocketBase/tables/match/Match'
import { ChampionId } from '../../../../../models/riot/ChampionId'
import type { TheQuestMatch } from '../../../../../models/theQuest/TheQuestMatch'
import { StaticDataChampion } from '../../../../../models/theQuest/staticData/StaticDataChampion'
import { objectValues } from '../../../../../utils/fpTsUtils'
import { SetTournament } from '../../../TournamentContext'

type Props = {
  params: { tournament: TournamentId }
}

const Champions: React.FC<Props> = ({ params }) =>
  withRedirectOnAuthError(getTournament(params.tournament))(data => (
    <>
      <SetTournament tournament={data?.tournament} />
      <ChampionsLoaded data={data} />
    </>
  ))

type ChampionsLoadedProps = {
  data: Optional<GetTournament>
}

const ChampionsLoaded: React.FC<ChampionsLoadedProps> = ({ data }) => {
  if (data === undefined) return notFound()

  const { staticData, stillAvailable, alreadyPlayed } = data

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2>Champions disponibles :</h2>
      <ul className="flex flex-wrap gap-1">
        {stillAvailable.map(c => (
          <CroppedChampionSquare
            key={c.key}
            version={staticData.version}
            championId={c.id}
            championName={c.name}
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
            as="li"
            className="relative h-12 w-12"
          >
            <span className="absolute top-[calc(100%_-_2px)] w-20 origin-left -rotate-45 border-t-4 border-red-500 shadow-even shadow-black" />
          </CroppedChampionSquare>
        ))}
      </ul>
    </div>
  )
}

export default Champions

type GetTournament = Merge<ViewTournament, PartionedChampions>

async function getTournament(tournamentId: TournamentId): Promise<Optional<GetTournament>> {
  'use server'

  const data = await viewTournament(tournamentId)

  if (data === undefined) return undefined

  const { matches, staticData } = data

  const partitioned = partionChampions(staticData.champions, matches)

  return { ...data, ...partitioned }
}

type PartionedChampions = {
  stillAvailable: ReadonlyArray<StaticDataChampion>
  alreadyPlayed: ReadonlyArray<StaticDataChampion>
}

function partionChampions(
  champions: ReadonlyArray<StaticDataChampion>,
  matches: ReadonlyArray<MatchApiDataDecoded>,
): PartionedChampions {
  const playedChampions = pipe(
    matches,
    readonlyArray.flatMap(match =>
      match.apiData.flatMap(d => (d !== undefined ? matchChampions(d) : [])),
    ),
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
