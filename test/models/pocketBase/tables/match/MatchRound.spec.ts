import { number, readonlyArray } from 'fp-ts'
import { pipe } from 'fp-ts/function'

import {
  GroupRound,
  KnockoutRound,
  MatchRound,
} from '../../../../../src/models/pocketBase/tables/match/MatchRound'
import { expectT } from '../../../../expectT'

describe('MatchRound', () => {
  describe('Ord', () => {
    it('should sort', () => {
      expectT(pipe([3, 1, 2], readonlyArray.sort(number.Ord))).toStrictEqual([1, 2, 3])

      const as: ReadonlyArray<MatchRound> = [
        KnockoutRound(1, false),
        GroupRound(3),
        KnockoutRound(3, true),
        GroupRound(2),
        KnockoutRound(2, false),
        KnockoutRound(3, false),
        KnockoutRound(2, true),
        KnockoutRound(1, true),
        GroupRound(1),
      ]

      expectT(pipe(as, readonlyArray.sort(MatchRound.Ord))).toStrictEqual([
        GroupRound(1),
        GroupRound(2),
        GroupRound(3),
        KnockoutRound(1, false),
        KnockoutRound(2, false),
        KnockoutRound(3, false),
        KnockoutRound(1, true),
        KnockoutRound(2, true),
        KnockoutRound(3, true),
      ])
    })
  })
})
