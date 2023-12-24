import { ord, string } from 'fp-ts'
import type { Ord } from 'fp-ts/Ord'
import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'

import { cleanUTF8ToASCII } from '../../../utils/stringUtils'
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

const byName: Ord<StaticDataChampion> = pipe(
  string.Ord,
  ord.contramap((c: StaticDataChampion) => cleanUTF8ToASCII(c.name)),
)

const StaticDataChampion = { decoder, byName }

export { StaticDataChampion }
