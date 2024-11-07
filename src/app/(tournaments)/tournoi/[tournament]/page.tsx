import { notFound } from 'next/navigation'

import type { ViewTournament } from '../../../../actions/viewTournament'
import { viewTournament } from '../../../../actions/viewTournament'
import { withRedirectOnAuthError } from '../../../../helpers/withRedirectOnAuthError'
import { Dayjs } from '../../../../models/Dayjs'
import { TournamentPhase } from '../../../../models/TournamentPhase'
import type { TournamentId } from '../../../../models/pocketBase/tables/Tournament'
import { SetTournament } from '../../TournamentContext'
import { TournamentSubPagesNav } from '../../TournamentSubPagesNav'

const dateTimeFormat = 'dddd D MMMM YYYY, HH:mm'

type Props = {
  params: Promise<{ tournament: TournamentId }>
}

const TournamentPage: React.FC<Props> = async props => {
  const params = await props.params

  return withRedirectOnAuthError(viewTournament(params.tournament))(data => (
    <>
      <SetTournament tournament={data?.tournament} />
      <TournamentPageLoaded data={data} />
    </>
  ))
}

type TournamentPageLoadedProps = {
  data: Optional<ViewTournament>
}

const TournamentPageLoaded: React.FC<TournamentPageLoadedProps> = ({ data }) => {
  if (data === undefined) return notFound()

  const { tournament, attendees } = data

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h1 className="text-6xl font-bold text-goldenrod">{tournament.name}</h1>

      <div className="flex items-center gap-3">
        <span className="font-bold">{Dayjs(tournament.start).format(dateTimeFormat)}</span>
        <span>—</span>
        <span className="font-bold">{Dayjs(tournament.end).format(dateTimeFormat)}</span>
      </div>

      <div className="text-lg font-bold text-green1">{TournamentPhase.label[tournament.phase]}</div>

      <span className="font-bold text-goldenrod">
        Participant·es ({attendees.length} / {tournament.teamsCount * 5})
      </span>

      <nav className="flex items-center gap-4 text-lg">
        <TournamentSubPagesNav
          tournament={tournament}
          subPage={undefined}
          linkClassName="underline"
        />
      </nav>
    </div>
  )
}

export default TournamentPage
