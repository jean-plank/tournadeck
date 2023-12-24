import type { Tournament } from '../../models/pocketBase/tables/Tournament'

type Props = {
  tournament: Tournament
}

export const TournamentTile: React.FC<Props> = ({ tournament }) => (
  <div className="w-80 rounded-lg bg-blue-200 p-3 hover:bg-sky-300">
    <div className="text-lg font-bold">{tournament.name}</div>

    <div>Début : {tournament.start}</div>
    <div>Fin : {tournament.end}</div>
  </div>
)
