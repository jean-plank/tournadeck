import * as C from 'io-ts/Codec'

import { DayjsDurationFromNumber, DayjsFromISOString } from '../../utils/ioTsUtils'
import { ChampionId } from '../riot/ChampionId'
import { GameId } from '../riot/GameId'
import { Puuid } from '../riot/Puuid'
import { RiotId } from '../riot/RiotId'
import { RiotTeamId } from '../riot/RiotTeamId'
import { Platform } from './Platform'

const teamDecoder = C.struct({
  participants: C.array(
    C.struct({
      assists: C.number,
      championName: ChampionId.codec,
      deaths: C.number,
      kills: C.number,
      profileIcon: C.number,
      puuid: Puuid.codec,
      riotId: C.nullable(RiotId.fromStringCodec('#')),
    }),
  ),
})

const teamProperties: ReadonlyRecord<`${RiotTeamId}`, typeof teamDecoder> = {
  100: teamDecoder,
  200: teamDecoder,
}

type TheQuestMatch = C.TypeOf<typeof codec>
type TheQuestMatchOutput = C.OutputOf<typeof codec>

const codec = C.struct({
  platform: Platform.codec,
  id: GameId.codec,
  gameCreation: DayjsFromISOString.codec,
  gameDuration: DayjsDurationFromNumber.codec,
  gameEndTimestamp: DayjsFromISOString.codec,
  teams: C.partial(teamProperties),
  win: RiotTeamId.codec,
})

const TheQuestMatch = { codec }

export { TheQuestMatch, type TheQuestMatchOutput }
