'use server'

import { either, readonlyArray } from 'fp-ts'
import { pipe } from 'fp-ts/function'

import { listAttendeesForTournament } from '../../../../../actions/helpers/listAttendeesForTournament'
import { listTeamsForTournament } from '../../../../../actions/helpers/listTeamsForTournament'
import { viewTournament } from '../../../../../actions/helpers/viewTournament'
import { Config } from '../../../../../config/Config'
import { theQuestService } from '../../../../../context/context'
import { adminPocketBase } from '../../../../../context/singletons/adminPocketBase'
import { Permissions } from '../../../../../helpers/Permissions'
import { withRedirectTournament } from '../../../../../helpers/withRedirectTournament'
import type { TournamentId } from '../../../../../models/pocketBase/tables/Tournament'
import type { MatchApiDataDecoded } from '../../../../../models/pocketBase/tables/match/Match'
import {
  MatchApiData,
  MatchApiDatas,
} from '../../../../../models/pocketBase/tables/match/MatchApiDatas'
import type { TheQuestMatch } from '../../../../../models/theQuest/TheQuestMatch'
import type { ViewTournamentMatches } from './Games'
import { Games } from './Games'

const { getFromPbCacheDuration, tags } = Config.constants

type Props = {
  params: Promise<{ tournament: TournamentId }>
}

const GamesPage: React.FC<Props> = async props => {
  const params = await props.params

  return withRedirectTournament(viewTournamentMatches(params.tournament))(data => (
    <Games data={data} />
  ))
}

export default GamesPage

async function viewTournamentMatches(
  tournamentId: TournamentId,
): Promise<Optional<ViewTournamentMatches>> {
  const data = await viewTournament(tournamentId)

  if (data === undefined) return undefined

  const { user, tournament } = data

  const adminPb = await adminPocketBase()

  const [staticData, teams, attendees, matches] = await Promise.all([
    theQuestService.getStaticData(true),
    listTeamsForTournament(adminPb, tournamentId),
    listAttendeesForTournament(adminPb, tournamentId),
    adminPb.collection('matches').getFullList({
      filter: adminPb.smartFilter<'matches'>({ tournament: tournamentId }),
      next: { revalidate: getFromPbCacheDuration, tags: [tags.matches] },
    }),
  ])

  return {
    version: staticData.version,
    tournament,
    teams,
    attendees,
    matches: pipe(
      matches,
      readonlyArray.map(
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
      ),
    ),
    canUpdateMatch: Permissions.matches.update(user.role),
  }
}
