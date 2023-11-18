import { Effect as E } from 'effect'
import { Effect } from 'effect/Effect'
import { either } from 'fp-ts'
import { Either } from 'fp-ts/Either'

export { type Effect as EffecT }

export const effectFromEither: <E, A>(fa: Either<E, A>) => Effect<never, E, A> = either.foldW(
  E.fail,
  E.succeed,
)
