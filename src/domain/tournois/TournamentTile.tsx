import type { Tournament } from '../../models/Tournament'

type Props = {
  data: Tournament
}

export const TournamentTile: React.FC<Props> = ({ data }) => (
  <div className="w-80 rounded-lg bg-blue-200 p-3 hover:bg-sky-300">
    <div className="text-lg font-bold">{data.name}</div>

    <div>Début : {data.start}</div>
    <div>Fin : {data.end}</div>
  </div>
)
