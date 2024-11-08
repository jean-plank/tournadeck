import { Dayjs } from '../../../models/Dayjs'
import type { Tournament } from '../../../models/pocketBase/tables/Tournament'

const dateTimeFormat = 'DD/MM/YYYY, HH:mm'

type Props = {
  tournament: Tournament
}

export const TournamentTile: React.FC<Props> = ({ tournament }) => (
  <div className="w-[30rem] rounded-lg border-2 border-goldenrod bg-white1 p-3 text-black transition-all duration-300 hover:w-[31rem] hover:px-5 hover:text-goldenrod">
    <h3 className="text-3xl font-black">{tournament.name}</h3>
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="text-black">Début : {Dayjs(tournament.start).format(dateTimeFormat)}</div>
      <div className="text-black">Fin : {Dayjs(tournament.end).format(dateTimeFormat)}</div>
    </div>
  </div>
)
