import { either, readonlyNonEmptyArray, readonlyRecord } from 'fp-ts'
import type { Either } from 'fp-ts/Either'

/**
 * Object.assign, but safe (don't mutate first argument)
 */
export function immutableAssign<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  A extends (...args: ReadonlyArray<any>) => unknown,
  B extends ReadonlyRecord<string, unknown>,
>(f: A, b: B): A & B {
  return Object.assign(f.bind({}) as A, b)
}

export const eitherGetOrThrow: <A>(fa: Either<Error, A>) => A = either.getOrElseW(e => {
  throw e
})

export const array = {
  empty: <A>(): ReadonlyArray<A> => [],
  groupBy: readonlyNonEmptyArray.groupBy as <A, K extends string>(
    f: (a: A) => K,
  ) => (as: ReadonlyArray<A>) => Partial<ReadonlyRecord<K, NonEmptyArray<A>>>,
}

export const partialRecord = {
  map: readonlyRecord.map as <A, B>(
    f: (a: A) => B,
  ) => <K extends string>(fa: Partial<ReadonlyRecord<K, A>>) => Partial<ReadonlyRecord<K, B>>,
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
