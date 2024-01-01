import * as C from 'io-ts/Codec'

import { MatchId } from './pocketBase/tables/match/MatchId'

type WinnerOf = C.TypeOf<typeof winnerOfCodec>

const winnerOfCodec = C.struct({
  type: C.literal('WinnerOf'),
  match: MatchId.codec,
})

function WinnerOf(match: MatchId): WinnerOf {
  return { type: 'WinnerOf', match }
}

// ---

type LoserOf = C.TypeOf<typeof loserOfCodec>

const loserOfCodec = C.struct({
  type: C.literal('LoserOf'),
  match: MatchId.codec,
})

function LoserOf(match: MatchId): LoserOf {
  return { type: 'LoserOf', match }
}

// ---

type WinnerOrLoserOf = C.TypeOf<typeof codec>
type WinnerOrLoserOfOutput = C.OutputOf<typeof codec>

const codec = C.sum('type')({
  WinnerOf: winnerOfCodec,
  LoserOf: loserOfCodec,
})

const WinnerOrLoserOf = { codec }

export { LoserOf, WinnerOf, WinnerOrLoserOf, type WinnerOrLoserOfOutput }
