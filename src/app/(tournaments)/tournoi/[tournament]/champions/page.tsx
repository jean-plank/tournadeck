import { readonlyArray } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { notFound } from 'next/navigation'

import { viewTournament } from '../../../../../actions/viewTournament'
import { withRedirectOnAuthError } from '../../../../../helpers/withRedirectOnAuthError'
import type { TournamentId } from '../../../../../models/pocketBase/tables/Tournament'
import type { MatchApiDataDecoded } from '../../../../../models/pocketBase/tables/match/Match'
import { ChampionId } from '../../../../../models/riot/ChampionId'
import type { TheQuestMatch } from '../../../../../models/theQuest/TheQuestMatch'
import { StaticDataChampion } from '../../../../../models/theQuest/staticData/StaticDataChampion'
import { objectValues } from '../../../../../utils/fpTsUtils'
import { SetTournament } from '../../../TournamentContext'
import { Champions, type GetTournament, type PartionedChampions } from './Champions'

type Props = {
  params: { tournament: TournamentId }
}

const ChampionsPage: React.FC<Props> = ({ params }) =>
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

  return <Champions {...data} />
}

export default ChampionsPage

async function getTournament(tournamentId: TournamentId): Promise<Optional<GetTournament>> {
  'use server'

  const data = await viewTournament(tournamentId)

  if (data === undefined) return undefined

  const { matches, staticData } = data

  const partitioned = partionChampions(staticData.champions, matches)

  return { ...data, ...partitioned, draftlolLink: 'https://blbl.ch' }
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
