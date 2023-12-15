import type { Tournament } from '../models/Tournament'

type Props = { data: Tournament }
export const TournamentTile: React.FC<Props> = ({ data }: Props) => {
  const afficherDateTime = (date: Date): string => {
    const jour: number = date.getDate()
    const mois: number = date.getMonth() + 1
    const annee: number = date.getFullYear()

    const heure: number = date.getHours()
    const minute: number = date.getMinutes()

    const dateHeureString: string = `${jour}/${mois}/${annee} ${heure}:${minute}`

    return dateHeureString
  }
  return (
    <div className="w-80 rounded-lg bg-blue-200 p-3 hover:cursor-pointer hover:bg-sky-300">
      <div className="text-lg font-bold">{data.name}</div>
      {/* <div>Debut : {afficherDateTime(data.start)}</div>
      <div>Debut : {afficherDateTime(data.end)}</div> */}
      <div>Debut : {data.start}</div>
      <div>Debut : {data.end}</div>
    </div>
  )
}
