import { eq, number, option } from 'fp-ts'
import { identity, pipe } from 'fp-ts/function'

import { array } from '../../src/utils/fpTsUtils'
import { expectT } from '../expectT'

describe('fpTsUtils', () => {
  describe('array', () => {
    describe('popWhere', () => {
      it('should return empty for empty array', () => {
        expectT(pipe([], array.popWhere(identity))).toStrictEqual([option.none, []])
      })

      it('should return same array if not match', () => {
        expectT(
          pipe(
            [1, 2, 3],
            array.popWhere(n => n === 4),
          ),
        ).toStrictEqual([option.none, [1, 2, 3]])
      })

      it('should pop first', () => {
        expectT(
          pipe(
            [1, 2, 3, 4, 5],
            array.popWhere(n => n === 1),
          ),
        ).toStrictEqual([option.some(1), [2, 3, 4, 5]])
      })

      it('should pop middle', () => {
        expectT(
          pipe(
            [1, 2, 3, 4, 5],
            array.popWhere(n => n === 4),
          ),
        ).toStrictEqual([option.some(4), [1, 2, 3, 5]])
      })

      it('should pop last', () => {
        expectT(
          pipe(
            [1, 2, 3, 4, 5],
            array.popWhere(n => n === 5),
          ),
        ).toStrictEqual([option.some(5), [1, 2, 3, 4]])
      })
    })

    describe('groupByMap', () => {
      it('should group empty array', () => {
        expectT(pipe([], array.groupByMap(eq.eqStrict)(identity))).toStrictEqual(
          new Map<never, never>(),
        )
      })

      it('should group for object', () => {
        const as: ReadonlyArray<{ id: { foo: number }; bar: string }> = [
          { id: { foo: 1 }, bar: 'abc' },
          { id: { foo: 1 }, bar: 'def' },
          { id: { foo: 2 }, bar: 'ABC' },
        ]

        const byIdEq = eq.struct<(typeof as)[number]['id']>({ foo: number.Eq })

        expectT(
          pipe(
            as,
            array.groupByMap(byIdEq)(a => a.id),
          ),
        ).toStrictEqual(
          new Map([
            [
              { foo: 1 },
              [
                { id: { foo: 1 }, bar: 'abc' },
                { id: { foo: 1 }, bar: 'def' },
              ],
            ],
            [{ foo: 2 }, [{ id: { foo: 2 }, bar: 'ABC' }]],
          ]),
        )
      })
    })

    describe('shuffle', () => {
      it('should return empty for empty array', () => {
        expectT(array.shuffle([])()).toStrictEqual([])
      })

      it('should return same elemt for one element', () => {
        expectT(array.shuffle([1])()).toStrictEqual([1])
      })

      it('should return same elemt for three elements', () => {
        const actual = array.shuffle([1, 2, 3])()

        expectT(actual.length).toStrictEqual(3)
        expectT(actual.includes(1)).toStrictEqual(true)
        expectT(actual.includes(2)).toStrictEqual(true)
        expectT(actual.includes(3)).toStrictEqual(true)
      })
    })

    describe('combine', () => {
      it('should return empty for empty array', () => {
        expectT(array.combine([])).toStrictEqual([])
      })

      it('should return empty for one element', () => {
        expectT(array.combine([1])).toStrictEqual([])
      })

      it('should combine for two elements', () => {
        expectT(array.combine([1, 2])).toStrictEqual([[1, 2]])
      })

      it('should combine for three elements', () => {
        expectT(array.combine([1, 2, 3])).toStrictEqual([
          [1, 2],
          [1, 3],
          [2, 3],
        ])
      })

      it('should combine for four elements', () => {
        expectT(array.combine([1, 2, 3, 4])).toStrictEqual([
          [1, 2],
          [1, 3],
          [1, 4],
          [2, 3],
          [2, 4],
          [3, 4],
        ])
      })
    })
  })
})
