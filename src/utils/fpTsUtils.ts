import { either } from 'fp-ts'
import type { Either } from 'fp-ts/Either'

export const eitherGetOrThrow: <A>(fa: Either<Error, A>) => A = either.getOrElseW(e => {
  throw e
})
