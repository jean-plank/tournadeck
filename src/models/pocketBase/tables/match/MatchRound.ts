import { boolean, eq, number, ord } from 'fp-ts'
import type { Eq } from 'fp-ts/Eq'
import type { Ord } from 'fp-ts/Ord'
import { pipe } from 'fp-ts/function'
import type { Except } from 'type-fest'

import { assertUnreachable } from '../../../../utils/fpTsUtils'

type GroupRound = {
  type: 'GroupRound'
  /**
   * 0-based
   */
  index: number
}

function GroupRound(index: number): GroupRound {
  return { type: 'GroupRound', index }
}

function groupRoundKey(r: GroupRound): string {
  return `${r.type}${r.index}`
}

const groupRoundEq: eq.Eq<GroupRound> = eq.struct<Except<GroupRound, 'type'>>({
  index: number.Eq,
})

const groupRoundOrd: ord.Ord<GroupRound> = pipe(
  number.Ord,
  ord.contramap((b: GroupRound) => b.index),
)

// ---

type KnockoutRound = {
  type: 'KnockoutRound'
  /**
   * 0-based
   */
  index: number
  isBronzeMatch: boolean
}

function KnockoutRound(index: number, isBronzeMatch: boolean): KnockoutRound {
  return { type: 'KnockoutRound', index, isBronzeMatch }
}

function knockoutRoundKey(r: KnockoutRound): string {
  return `${r.type}${r.index}${r.isBronzeMatch}`
}

const knockoutRoundEq: eq.Eq<KnockoutRound> = eq.struct<Except<KnockoutRound, 'type'>>({
  index: number.Eq,
  isBronzeMatch: boolean.Eq,
})

const knockoutRoundOrd: ord.Ord<KnockoutRound> = ord.getSemigroup<KnockoutRound>().concat(
  pipe(
    boolean.Ord,
    ord.contramap((b: KnockoutRound) => b.isBronzeMatch),
  ),
  pipe(
    number.Ord,
    ord.contramap((b: KnockoutRound) => b.index),
  ),
)

// ---

type MatchRound = GroupRound | KnockoutRound

/**
 * Get a React key
 */
function key(r: MatchRound): string {
  switch (r.type) {
    case 'GroupRound':
      return groupRoundKey(r)

    case 'KnockoutRound':
      return knockoutRoundKey(r)
  }
}

const matchRoundEq: Eq<MatchRound> = eq.fromEquals((x, y) => {
  switch (x.type) {
    case 'GroupRound':
      if (y.type === 'GroupRound') return groupRoundEq.equals(x, y)

      return false

    case 'KnockoutRound':
      if (y.type === 'KnockoutRound') return knockoutRoundEq.equals(x, y)

      return false

    default:
      return assertUnreachable(x)
  }
})

const matchRoundOrd: Ord<MatchRound> = ord.fromCompare((first, second) => {
  switch (first.type) {
    case 'GroupRound':
      switch (second.type) {
        case 'GroupRound':
          return groupRoundOrd.compare(first, second)

        case 'KnockoutRound':
          return -1

        default:
          return assertUnreachable(second)
      }

    case 'KnockoutRound':
      switch (second.type) {
        case 'KnockoutRound':
          return knockoutRoundOrd.compare(first, second)

        case 'GroupRound':
          return 1

        default:
          return assertUnreachable(second)
      }

    default:
      return assertUnreachable(first)
  }
})

const MatchRound = { key, Eq: matchRoundEq, Ord: matchRoundOrd }

export { GroupRound, KnockoutRound, MatchRound }
