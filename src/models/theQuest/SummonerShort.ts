import * as D from 'io-ts/Decoder'

import { Puuid } from '../riot/Puuid'
import { RiotId } from '../riot/RiotId'
import { SummonerName } from '../riot/SummonerName'
import { Platform } from './Platform'

type SummonerShort = D.TypeOf<typeof codec>

const codec = D.struct({
  platform: Platform.codec,
  puuid: Puuid.codec,
  riotId: RiotId.fromStringCodec('#'),
  name: SummonerName.codec,
  profileIconId: D.number,
})

const SummonerShort = { codec }

export { SummonerShort }
