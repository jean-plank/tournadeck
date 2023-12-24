import type { Codec } from 'io-ts/Codec'
import * as C from 'io-ts/Codec'
import type { Decoder } from 'io-ts/Decoder'
import * as D from 'io-ts/Decoder'
import type * as E from 'io-ts/Encoder'
import type { Encoder } from 'io-ts/Encoder'

import { GameId } from '../../../riot/GameId'
import { TheQuestMatch, type TheQuestMatchOutput } from '../../../theQuest/TheQuestMatch'

type MatchApiData = D.TypeOf<typeof decoder>
type MatchApiDataOutput = E.OutputOf<typeof encoder>

const decoder: Decoder<unknown, GameId | TheQuestMatch> = D.union(GameId.codec, TheQuestMatch.codec)

const encoder: Encoder<GameId | TheQuestMatchOutput, MatchApiData> = {
  encode: a => (isGameId(a) ? a : TheQuestMatch.codec.encode(a)),
}

function isGameId(apiData: MatchApiData): apiData is GameId {
  return typeof apiData === 'number'
}

const codec: Codec<unknown, MatchApiDataOutput, MatchApiData> = C.make(decoder, encoder)

const MatchApiData = { codec, isGameId }

export { MatchApiData, type MatchApiDataOutput }
