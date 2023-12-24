import * as D from 'io-ts/Decoder'

import { TeamRole } from '../../TeamRole'
import { ChampionId } from '../../riot/ChampionId'
import { ChampionKey } from '../../riot/ChampionKey'
import { ChampionFaction } from '../ChampionFaction'

type StaticDataChampion = D.TypeOf<typeof decoder>

const decoder = D.struct({
  id: ChampionId.codec,
  key: ChampionKey.codec,
  name: D.string,
  positions: D.array(TeamRole.decoder),
  factions: D.array(ChampionFaction.decoder),
})

const StaticDataChampion = { decoder }

export { StaticDataChampion }
