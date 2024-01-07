import type { TheQuestMatchParticipant } from '../../../../../models/theQuest/TheQuestMatch'

type Props = {
  left: ReadonlyArray<TheQuestMatchParticipant>
  right: ReadonlyArray<TheQuestMatchParticipant>
}

export const MatchTooltip: React.FC<Props> = ({ left, right }) => (
  <div>
    <ul>
      {left.map(p => (
        <li key={p.puuid}>
          {p.riotId?.gameName}#{p.riotId?.tagLine}
        </li>
      ))}
    </ul>

    <ul>
      {right.map(p => (
        <li key={p.puuid}>
          {p.riotId?.gameName}#{p.riotId?.tagLine}
        </li>
      ))}
    </ul>
  </div>
)
