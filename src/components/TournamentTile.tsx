import type { Tournament } from '../models/Tournament'

type Props = { data: Tournament }
export const TournamentTile: React.FC<Props> = ({ data }: Props) => (
  <div className="w-80 rounded-lg bg-blue-200 p-3 hover:cursor-pointer hover:bg-sky-300">
    <div className="text-lg font-bold">{data.name}</div>

    <div>Debut : {data.start}</div>
    <div>Debut : {data.end}</div>
  </div>
)
