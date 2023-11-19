import { Effect as effect } from 'effect'
import type { Effect } from 'effect/Effect'
import { either } from 'fp-ts'
import type { Either } from 'fp-ts/Either'

import { unknownToError } from '@/utils/unknownToError'

export function emptyRecord<K extends PropertyKey, A>(): ReadonlyRecord<K, A> {
  return {} as ReadonlyRecord<K, A>
}

// We don't plan on using requirements.
export type EffecT<E, A> = Effect<never, E, A>

export const effectFromEither: <E, A>(fa: Either<E, A>) => Effect<never, E, A> = either.foldW(
  effect.fail,
  effect.succeed,
)

export function effectTryPromise<A>(try_: (signal: AbortSignal) => Promise<A>): EffecT<Error, A> {
  return effect.tryPromise({
    try: try_,
    catch: unknownToError,
  })
}
