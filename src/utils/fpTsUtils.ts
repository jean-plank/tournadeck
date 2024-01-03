import {
  either,
  option,
  ord,
  random,
  readonlyArray,
  readonlyMap,
  readonlyNonEmptyArray,
  readonlyRecord,
} from 'fp-ts'
import type { Either } from 'fp-ts/Either'
import type { Eq } from 'fp-ts/Eq'
import type { IO } from 'fp-ts/IO'
import type { Ord } from 'fp-ts/Ord'
import { pipe } from 'fp-ts/function'

export function todo(...[]: ReadonlyArray<unknown>): never {
  throw Error('Missing implementation')
}

export function assertUnreachable(n: never): never {
  throw Error(`Unexpected value: ${n}`)
}

/**
 * Object.assign, but safe (don't mutate first argument)
 */
export function immutableAssign<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  A extends (...args: ReadonlyArray<any>) => unknown,
  B extends ReadonlyRecord<PropertyKey, unknown>,
>(f: A, b: B): A & B {
  return Object.assign(f.bind({}) as A, b)
}

export function isDefined<A>(a: Optional<A>): a is A {
  return a !== undefined
}

/**
 * Like ord.trivial, but with actual equals.
 */
export function idcOrd<A>({ equals }: Eq<A>): Ord<A> {
  return {
    equals,
    compare: (first: A, second: A) =>
      equals(first, second) ? 0 : ord.trivial.compare(first, second),
  }
}

export const eitherGetOrThrow: <A>(fa: Either<Error, A>) => A = either.getOrElseW(e => {
  throw e
})

const arrayShuffle =
  <A>(as: ReadonlyArray<A>): IO<ReadonlyArray<A>> =>
  () => {
    if (!readonlyArray.isNonEmpty(as)) return []

    const i = random.randomInt(0, as.length - 1)()

    return [as[i], ...arrayShuffle(readonlyArray.unsafeDeleteAt(i, as))()]
  }

function arrayCombine<A>(as: ReadonlyArray<A>): ReadonlyArray<readonly [A, A]> {
  const [head, ...tail] = as

  if (head === undefined) return []

  return [...tail.map(a => [head, a] as const), ...arrayCombine(tail)]
}

export const array = {
  empty: <A>(): ReadonlyArray<A> => [],

  groupBy: readonlyNonEmptyArray.groupBy as <A, K extends string | number>(
    f: (a: A) => K,
  ) => (as: ReadonlyArray<A>) => Partial<ReadonlyRecord<`${K}`, NonEmptyArray<A>>>,

  groupByMap:
    <L>(E: Eq<L>) =>
    <A, K extends L>(f: (a: A) => K) =>
    (as: ReadonlyArray<A>): ReadonlyMap<K, NonEmptyArray<A>> => {
      let out: ReadonlyMap<K, NonEmptyArray<A>> = new Map()

      for (const a of as) {
        const k = f(a)

        const as_ = pipe(
          out,
          readonlyMap.lookup(E)(k),
          option.fold(() => readonlyNonEmptyArray.of(a), readonlyArray.append(a)),
        )

        out = pipe(out, readonlyMap.upsertAt<K>(E)(k, as_))
      }

      return out
    },

  shuffle: arrayShuffle,
  // shuffle:
  //   <A>(as: ReadonlyArray<A>) =>
  //   (): ReadonlyArray<A> => {
  //     const out = Array.from(as)

  //     for (let i = out.length - 1; i > 0; i--) {
  //       const j = Math.floor(Math.random() * (i + 1))

  //       ;[out[i], out[j]] = [out[j], out[i]]
  //     }

  //     return out
  //   },

  combine: arrayCombine,
}

export const partialRecord = {
  map: readonlyRecord.map as <A, B>(
    f: (a: Optional<A>) => B,
  ) => <K extends string>(fa: Partial<ReadonlyRecord<K, A>>) => Partial<ReadonlyRecord<K, B>>,

  mapWithIndex: readonlyRecord.mapWithIndex as <K extends string, A, B>(
    f: (k: K, a: Optional<A>) => B,
  ) => (fa: Partial<ReadonlyRecord<K, A>>) => Partial<ReadonlyRecord<K, B>>,
}

export const objectKeys: <A extends Partial<ReadonlyRecord<PropertyKey, unknown>>>(
  a: A,
) => ReadonlyArray<keyof A> = Object.keys

export const objectEntries: <A extends Partial<ReadonlyRecord<PropertyKey, unknown>>>(
  a: A,
) => ReadonlyArray<{ [K in keyof A]-?: [K, A[K]] }[keyof A]> = Object.entries

export const objectValues: <A extends Partial<ReadonlyRecord<PropertyKey, unknown>>>(
  a: A,
) => ReadonlyArray<A[keyof A]> = Object.values

export const record = {
  empty: <K extends PropertyKey, A>(): ReadonlyRecord<K, A> => ({}) as ReadonlyRecord<K, A>,
}
