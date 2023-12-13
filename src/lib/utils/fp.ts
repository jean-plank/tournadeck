import { Effect as effect, flow, identity, pipe } from 'effect'
import type { Effect } from 'effect/Effect'
import type { LazyArg } from 'effect/Function'
import { either } from 'fp-ts'
import type { Either } from 'fp-ts/Either'

import type { DecoderWithName } from '../models/ioTsModels'
import { decodeError } from './ioTsUtils'
import { unknownToError } from './unknownToError'

export function todo(...[]: ReadonlyArray<unknown>): never {
  throw Error('Missing implementation')
}

export function assertUnreachable(n: never): never {
  throw Error(`Unexpected value: ${n}`)
}

export const inspect =
  (...label: ReadonlyArray<unknown>) =>
  <A>(a: A): A => {
    console.log(...label, a)
    return a
  }

export const arrayMutable = identity as <A extends ReadonlyArray<unknown>>(fa: A) => MutableArray<A>

export function arrayMkString(sep: string): (list: ReadonlyArray<string>) => string
export function arrayMkString(
  start: string,
  sep: string,
  end: string,
): (list: ReadonlyArray<string>) => string
export function arrayMkString(
  startOrSep: string,
  sep?: string,
  end?: string,
): (list: ReadonlyArray<string>) => string {
  return list =>
    sep !== undefined && end !== undefined
      ? `${startOrSep}${list.join(sep)}${end}`
      : list.join(startOrSep)
}

export function recordEmpty<K extends PropertyKey, A>(): ReadonlyRecord<K, A> {
  return {} as ReadonlyRecord<K, A>
}

export function partialRecordEmpty<K extends PropertyKey, A>(): PartialReadonlyRecord<K, A> {
  return {} as PartialReadonlyRecord<K, A>
}

export const recordEntries = Object.entries as <K extends PropertyKey, A>(
  r: ReadonlyRecord<K, A>,
) => ReadonlyArray<[K, A]>

export const recordFromEntries = Object.fromEntries as <K extends PropertyKey, A>(
  entries: Iterable<readonly [K, A]>,
) => PartialReadonlyRecord<K, A>

export const effectFromEither: <E, A>(fa: Either<E, A>) => Effect<never, E, A> = either.foldW(
  effect.fail,
  effect.succeed,
)

// We don't plan on using requirements or another E than Error
type EffecT<A> = Effect<never, Error, A>

const effecTFromUnknownEither: <A>(fa: Either<unknown, A>) => EffecT<A> = flow(
  effectFromEither,
  effect.mapError(unknownToError),
)

const EffecT = {
  fromUnknownEither: effecTFromUnknownEither,

  try: <A>(evaluate: LazyArg<A>): EffecT<A> =>
    pipe(effect.try(evaluate), effect.mapError(unknownToError)),

  tryPromise: <A>(try_: (signal: AbortSignal) => Promise<A>): EffecT<A> =>
    effect.tryPromise({
      try: try_,
      catch: unknownToError,
    }),

  flatMapFirst: <A, B>(f: (a: A) => EffecT<B>): ((fa: EffecT<A>) => EffecT<A>) =>
    effect.flatMap(a =>
      pipe(
        f(a),
        effect.map(() => a),
      ),
    ),
}

export { EffecT }

export const decodeEffecT =
  <I, A>(decoder: DecoderWithName<I, A>) =>
  (i: I): EffecT<A> =>
    pipe(decoder.decode(i), effectFromEither, effect.mapError(decodeError(decoder.name)(i)))

/**
 * Copy-pasta from https://github.com/sindresorhus/type-fest/blob/main/source/writable.d.ts
 */
type MutableArray<ArrayType extends ReadonlyArray<unknown>> = ArrayType extends readonly []
  ? []
  : ArrayType extends readonly [...infer U, infer V]
    ? [...U, V]
    : ArrayType extends readonly [infer U, ...infer V]
      ? [U, ...V]
      : ArrayType extends ReadonlyArray<infer U>
        ? U[]
        : ArrayType
