'use server'

import { viewTournament as viewTournamentBase } from '../../../../actions/helpers/viewTournament'
import { Config } from '../../../../config/Config'
import { adminPocketBase } from '../../../../context/singletons/adminPocketBase'
import { Permissions } from '../../../../helpers/Permissions'
import { withRedirectTournament } from '../../../../helpers/withRedirectTournament'
import { Dayjs } from '../../../../models/Dayjs'
import { TeamRole } from '../../../../models/TeamRole'
import { TournamentPhase } from '../../../../models/TournamentPhase'
import type { Tournament, TournamentId } from '../../../../models/pocketBase/tables/Tournament'
import { TournamentSubPagesNav } from '../../TournamentSubPagesNav'

const { getFromPbCacheDuration, tags } = Config.constants

const dateTimeFormat = 'dddd D MMMM YYYY, HH:mm'

type Props = {
  params: Promise<{ tournament: TournamentId }>
}

const TournamentPage: React.FC<Props> = async props => {
  const params = await props.params

  return withRedirectTournament(viewTournament(params.tournament))(
    ({ tournament, attendeesCount, displayAdmin }) => (
      <div className="flex flex-col items-center gap-4 p-4">
        <h1 className="text-6xl font-bold text-goldenrod">{tournament.name}</h1>

        <div className="flex items-center gap-3">
          <span className="font-bold">{Dayjs(tournament.start).format(dateTimeFormat)}</span>
          <span>—</span>
          <span className="font-bold">{Dayjs(tournament.end).format(dateTimeFormat)}</span>
        </div>

        <div className="flex gap-6 text-lg">
          <span className="text-lg font-bold text-sky-300">
            {TournamentPhase.label[tournament.phase]}
          </span>

          {!tournament.isVisible && <span className="font-bold text-red-500">[Non publié]</span>}
        </div>

        <span className="font-bold text-goldenrod">
          Participant·es ({attendeesCount} / {tournament.teamsCount * TeamRole.values.length})
        </span>

        <nav className="flex items-center gap-4 text-lg">
          <TournamentSubPagesNav
            tournament={tournament}
            subPage={undefined}
            displayAdmin={displayAdmin}
            linkClassName="underline"
          />
        </nav>
      </div>
    ),
  )
}

export default TournamentPage

type ViewTournament = {
  tournament: Tournament
  attendeesCount: number
  displayAdmin: boolean
}

async function viewTournament(tournamentId: TournamentId): Promise<Optional<ViewTournament>> {
  const data = await viewTournamentBase(tournamentId)

  if (data === undefined) return undefined

  const { user, tournament } = data

  const adminPb = await adminPocketBase()

  const attendees = await adminPb
    .collection('attendees')
    .getFullList<ReadonlyRecord<string, never>>({
      filter: adminPb.smartFilter<'attendees'>({ tournament: tournamentId }),
      // TODO: typings: automatic ReadonlyRecord<string, never>
      fields: 'none',
      next: { revalidate: getFromPbCacheDuration, tags: [tags.attendees] },
    })

  return {
    tournament,
    attendeesCount: attendees.length,
    displayAdmin: Permissions.tournaments.create(user.role),
  }
}
