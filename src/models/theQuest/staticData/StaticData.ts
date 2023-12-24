import * as D from 'io-ts/Decoder'

import { DDragonVersion } from '../../riot/DDragonVersion'
import { StaticDataChampion } from './StaticDataChampion'

type StaticData = D.TypeOf<typeof decoder>

const decoder = D.struct({
  version: DDragonVersion.codec,
  champions: D.array(StaticDataChampion.decoder),
})

const StaticData = { decoder }

export { StaticData }
