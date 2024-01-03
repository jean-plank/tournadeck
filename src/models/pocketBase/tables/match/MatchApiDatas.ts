import { eq, readonlyArray } from 'fp-ts'
import type { Codec } from 'io-ts/Codec'
import * as C from 'io-ts/Codec'
import type { Decoder } from 'io-ts/Decoder'
import * as D from 'io-ts/Decoder'
import type { Encoder } from 'io-ts/Encoder'

import { GameId } from '../../../riot/GameId'
import { TheQuestMatch, type TheQuestMatchOutput } from '../../../theQuest/TheQuestMatch'

type MatchApiData = GameId | TheQuestMatch
type MatchApiDataOutput = GameId | TheQuestMatchOutput

function isGameId(data: GameId | TheQuestMatch): data is GameId {
  return typeof data === 'number'
}

const dataDecoder: Decoder<unknown, MatchApiData> = D.union(GameId.codec, TheQuestMatch.codec)

const dataEncoder: Encoder<MatchApiDataOutput, MatchApiData> = {
  encode: a => (isGameId(a) ? a : TheQuestMatch.codec.encode(a)),
}

const dataEq: eq.Eq<MatchApiData> = eq.fromEquals((x, y) => {
  if (isGameId(x)) {
    if (isGameId(y)) return GameId.Eq.equals(x, y)

    return false
  }

  if (isGameId(y)) return false

  // just check byId Eq
  return GameId.Eq.equals(x.id, y.id)
})

const MatchApiData = { isGameId }

// ---

type MatchApiDatas = null | ReadonlyArray<MatchApiData>
type MatchApiDatasOutput = null | ReadonlyArray<MatchApiDataOutput>

const datasDecoder: Decoder<unknown, MatchApiDatas> = D.nullable(D.array(dataDecoder))

const datasEncoder: Encoder<MatchApiDatasOutput, MatchApiDatas> = {
  encode: as => (as === null ? null : as.map(dataEncoder.encode)),
}

const datasCodec: Codec<unknown, MatchApiDatasOutput, MatchApiDatas> = C.make(
  datasDecoder,
  datasEncoder,
)

const nonNullableDataEq = readonlyArray.getEq(dataEq)
const datasEq: eq.Eq<MatchApiDatas> = eq.fromEquals((x, y) => {
  if (x !== null && y !== null) return nonNullableDataEq.equals(x, y)

  return x === y
})

const MatchApiDatas = { codec: datasCodec, Eq: datasEq }

export { MatchApiData, MatchApiDatas, type MatchApiDatasOutput }
