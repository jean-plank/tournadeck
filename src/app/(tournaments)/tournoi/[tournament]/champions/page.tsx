import { readonlyArray } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { notFound } from 'next/navigation'
import type { Merge } from 'type-fest'

import { viewTournament } from '../../../../../actions/viewTournament'
import { Permissions } from '../../../../../helpers/Permissions'
import { getDraftlolLink } from '../../../../../helpers/getDraftlolLink'
import { withRedirectOnAuthError } from '../../../../../helpers/withRedirectOnAuthError'
import type { Tournament, TournamentId } from '../../../../../models/pocketBase/tables/Tournament'
import type { MatchApiDataDecoded } from '../../../../../models/pocketBase/tables/match/Match'
import { ChampionId } from '../../../../../models/riot/ChampionId'
import type { TheQuestMatch } from '../../../../../models/theQuest/TheQuestMatch'
import type { StaticData } from '../../../../../models/theQuest/staticData/StaticData'
import { StaticDataChampion } from '../../../../../models/theQuest/staticData/StaticDataChampion'
import { objectValues } from '../../../../../utils/fpTsUtils'
import { SetTournament } from '../../../TournamentContext'
import { Champions, type PartionedChampions } from './Champions'

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

  const { tournament, staticData, stillAvailable, alreadyPlayed, draftlolLink } = data

  return (
    <Champions
      tournamentId={tournament.id}
      staticData={staticData}
      stillAvailable={stillAvailable}
      alreadyPlayed={alreadyPlayed}
      draftlolLink={draftlolLink}
    />
  )
}

export default ChampionsPage

type GetTournament = Merge<
  {
    tournament: Tournament
    staticData: StaticData
    draftlolLink: Optional<string>
  },
  PartionedChampions
>

async function getTournament(tournamentId: TournamentId): Promise<Optional<GetTournament>> {
  'use server'

  const data = await viewTournament(tournamentId)

  if (data === undefined) return undefined

  const { user, tournament, matches, staticData } = data

  const { stillAvailable, alreadyPlayed } = partionChampions(staticData.champions, matches)

  const draftlolLink: Optional<string> = Permissions.championSelect.create(user.role)
    ? await getDraftlolLink(
        tournament.id,
        alreadyPlayed.map(c => c.id),
      )
    : undefined

  return { tournament, staticData, stillAvailable, alreadyPlayed, draftlolLink }
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
