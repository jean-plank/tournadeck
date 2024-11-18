'use server'

import { either, readonlyArray } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import type { Merge } from 'type-fest'

import { viewTournament } from '../../../../../actions/helpers/viewTournament'
import { Config } from '../../../../../config/Config'
import { theQuestService } from '../../../../../context/context'
import { adminPocketBase } from '../../../../../context/singletons/adminPocketBase'
import { Permissions } from '../../../../../helpers/Permissions'
import { draftlolLink as getDraftlolLink } from '../../../../../helpers/draftlolLink'
import { withRedirectTournament } from '../../../../../helpers/withRedirectTournament'
import type { MyPocketBase } from '../../../../../models/pocketBase/MyPocketBase'
import type { Tournament, TournamentId } from '../../../../../models/pocketBase/tables/Tournament'
import type { MatchApiDataDecoded } from '../../../../../models/pocketBase/tables/match/Match'
import {
  MatchApiData,
  MatchApiDatas,
} from '../../../../../models/pocketBase/tables/match/MatchApiDatas'
import { ChampionId } from '../../../../../models/riot/ChampionId'
import type { TheQuestMatch } from '../../../../../models/theQuest/TheQuestMatch'
import type { StaticData } from '../../../../../models/theQuest/staticData/StaticData'
import { StaticDataChampion } from '../../../../../models/theQuest/staticData/StaticDataChampion'
import { objectValues } from '../../../../../utils/fpTsUtils'
import { Champions, type PartionedChampions } from './Champions'

const { getFromPbCacheDuration, tags } = Config.constants

type Props = {
  params: Promise<{ tournament: TournamentId }>
}

const ChampionsPage: React.FC<Props> = async props => {
  const params = await props.params

  return withRedirectTournament(viewTournamentChampions(params.tournament))(
    ({ staticData, stillAvailable, alreadyPlayed, draftlolLink }) => (
      <Champions
        staticData={staticData}
        stillAvailable={stillAvailable}
        alreadyPlayed={alreadyPlayed}
        draftlolLink={draftlolLink}
      />
    ),
  )
}

export default ChampionsPage

type ViewTournamentChampions = Merge<
  {
    tournament: Tournament
    staticData: StaticData
    draftlolLink: Optional<string>
  },
  PartionedChampions
>

async function viewTournamentChampions(
  tournamentId: TournamentId,
): Promise<Optional<ViewTournamentChampions>> {
  const data = await viewTournament(tournamentId)

  if (data === undefined) return undefined

  const { user, tournament } = data

  const adminPb = await adminPocketBase()

  const [matches, staticData] = await Promise.all([
    listMatchesForTournament(adminPb, tournamentId),
    theQuestService.getStaticData(true),
  ])

  const { stillAvailable, alreadyPlayed } = partionChampions(
    staticData.champions,
    matches,
    tournament.bannedChampions !== null ? tournament.bannedChampions : [],
  )

  const draftlolLink: Optional<string> = Permissions.championSelect.create(user.role)
    ? getDraftlolLink(alreadyPlayed.map(c => c.key))
    : undefined

  return { tournament, staticData, stillAvailable, alreadyPlayed, draftlolLink }
}

async function listMatchesForTournament(
  adminPb: MyPocketBase,
  tournamentId: TournamentId,
): Promise<ReadonlyArray<MatchApiDataDecoded>> {
  const matches = await adminPb.collection('matches').getFullList({
    filter: adminPb.smartFilter<'matches'>({ tournament: tournamentId }),
    next: { revalidate: getFromPbCacheDuration, tags: [tags.matches] },
  })

  return matches.map(
    (m): MatchApiDataDecoded => ({
      ...m,
      apiData: pipe(
        MatchApiDatas.codec.decode(m.apiData),
        either.fold(
          () => [],
          apiData =>
            apiData !== null
              ? apiData.map(
                  (d): Optional<TheQuestMatch> => (MatchApiData.isGameId(d) ? undefined : d),
                )
              : [],
        ),
      ),
    }),
  )
}

function partionChampions(
  champions: ReadonlyArray<StaticDataChampion>,
  matches: ReadonlyArray<MatchApiDataDecoded>,
  bannedChampions: ReadonlyArray<ChampionId>,
): PartionedChampions {
  const playedChampions = pipe(
    matches,
    readonlyArray.flatMap(match =>
      match.apiData.flatMap(d => (d !== undefined ? matchChampions(d) : [])),
    ),
    readonlyArray.concat(bannedChampions),
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
