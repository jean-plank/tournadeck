import { Effect as effect, flow, pipe } from 'effect'
import type { Effect } from 'effect/Effect'
import { either } from 'fp-ts'
import type { Either } from 'fp-ts/Either'

import type { DecoderWithName } from '../models/ioTsModels'
import { decodeError } from './ioTsUtils'
import { unknownToError } from './unknownToError'

export function todo(...[]: ReadonlyArray<unknown>): never {
  throw Error('Missing implementation')
}

export function emptyRecord<K extends PropertyKey, A>(): ReadonlyRecord<K, A> {
  return {} as ReadonlyRecord<K, A>
}

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
