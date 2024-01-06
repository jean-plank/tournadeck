import * as C from 'io-ts/Codec'

import { DateFromISOString, DayjsDurationFromNumber } from '../../utils/ioTsUtils'
import { ChampionId } from '../riot/ChampionId'
import { GameId } from '../riot/GameId'
import { Puuid } from '../riot/Puuid'
import { RiotId } from '../riot/RiotId'
import { RiotTeamId } from '../riot/RiotTeamId'
import { Platform } from './Platform'

export type TheQuestMatchParticipant = C.TypeOf<typeof participantCodec>

const participantCodec = C.struct({
  assists: C.number,
  championName: ChampionId.codec,
  deaths: C.number,
  goldEarned: C.number,
  kills: C.number,
  profileIcon: C.number,
  puuid: Puuid.codec,
  riotId: C.nullable(RiotId.fromStringCodec('#')),
})

export type TheQuestMatchTeam = C.TypeOf<typeof teamCodec>

const teamCodec = C.struct({
  participants: C.readonly(C.array(participantCodec)),
})

const teamProperties: ReadonlyRecord<`${RiotTeamId}`, typeof teamCodec> = {
  100: teamCodec,
  200: teamCodec,
}

type TheQuestMatch = C.TypeOf<typeof codec>
type TheQuestMatchOutput = C.OutputOf<typeof codec>

const codec = C.struct({
  platform: Platform.codec,
  id: GameId.codec,
  gameCreation: DateFromISOString.codec,
  gameDuration: DayjsDurationFromNumber.codec,
  gameEndTimestamp: DateFromISOString.codec,
  teams: C.partial(teamProperties),
  win: RiotTeamId.codec,
})

const TheQuestMatch = { codec }

export { TheQuestMatch, type TheQuestMatchOutput }
