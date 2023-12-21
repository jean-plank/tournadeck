import { either } from 'fp-ts'
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
