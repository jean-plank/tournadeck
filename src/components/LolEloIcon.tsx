import Image from 'next/image'

import { LolElo } from '../models/LolElo'

type Props = {
  elo: LolElo
  className?: string
}

export const LolEloIcon: React.FC<Props> = ({ elo, className }) => (
  <Image
    className={className}
    alt={`Icône ${LolElo.label[elo]}`}
    width={200}
    height={200}
    src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/${elo}.png`}
  />
)
