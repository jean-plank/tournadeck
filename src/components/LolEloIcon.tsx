import type { LolElo } from '../models/LolElo'

type Props = {
  elo: LolElo
  className: string
}
export const LolEloIcon: React.FC<Props> = ({ elo, className }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    className={className}
    alt={`${elo}-icon`}
    // width={200}
    // height={200}
    src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/${elo}.png`}
  />
)
