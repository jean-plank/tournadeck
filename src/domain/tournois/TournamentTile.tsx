import { extractDateAndTime } from '../../models/Dayjs'
import { TournamentPhase } from '../../models/TournamentPhase'
import type { Tournament } from '../../models/pocketBase/tables/Tournament'

type Props = {
  tournament: Tournament
}

export const TournamentTile: React.FC<Props> = ({ tournament }) => {
  const dateDebut = extractDateAndTime(tournament.start)
  const dateFin = extractDateAndTime(tournament.end)
  return (
    <div className="w-[30rem] rounded-lg border-2 border-gold bg-white1 p-3 text-black hover:w-[31rem] hover:text-gold">
      <div className="text-[2rem] font-black">{tournament.name}</div>
      <div className="text-lg font-bold text-green1">{TournamentPhase.label[tournament.phase]}</div>
      <div className="text-sm">
        <div className="text-black ">Début : {dateDebut?.date}</div>
        <div className="text-black">Fin : {dateFin?.date}</div>
      </div>
    </div>
  )
}
