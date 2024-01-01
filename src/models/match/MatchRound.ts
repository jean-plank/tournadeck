import * as C from 'io-ts/Codec'

type GroupRound = C.TypeOf<typeof groupRoundCodec>

const groupRoundCodec = C.struct({
  type: C.literal('GroupRound'),
  /**
   * 0-based
   */
  index: C.number,
})

function GroupRound(index: number): GroupRound {
  return { type: 'GroupRound', index }
}

// ---

type KnockoutRound = C.TypeOf<typeof knockoutRoundCodec>

const knockoutRoundCodec = C.struct({
  type: C.literal('KnockoutRound'),
  /**
   * 0-based
   */
  index: C.number,
  isBronzeMatch: C.boolean,
})

function KnockoutRound(index: number, isBronzeMatch: boolean): KnockoutRound {
  return { type: 'KnockoutRound', index, isBronzeMatch }
}

// ---

type MatchRound = C.TypeOf<typeof codec>
type MatchRoundOutput = C.OutputOf<typeof codec>

const codec = C.sum('type')({
  GroupRound: groupRoundCodec,
  KnockoutRound: knockoutRoundCodec,
})

const MatchRound = { codec }

export { GroupRound, KnockoutRound, MatchRound, type MatchRoundOutput }
