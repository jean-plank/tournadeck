import Image from 'next/image'

import type { LolElo } from '../models/LolElo'

type Props = {
  elo: LolElo
  className?: string
}

export const LolEloIcon: React.FC<Props> = ({ elo, className }) => (
  <Image
    className={className}
    alt={`${elo}-icon`}
    width={200}
    height={200}
    src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/${elo}.png`}
  />
)
